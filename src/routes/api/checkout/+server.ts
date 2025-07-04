import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

// Initialize Stripe - handle both mock and real scenarios
let stripe: Stripe | null = null;
let isMockMode = false;

if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY !== 'sk_test_your_secret_key_here') {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
  });
} else {
  console.log('Using mock Stripe mode - no valid STRIPE_SECRET_KEY found');
  isMockMode = true;
}

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  try {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      throw error(401, 'Must be logged in');
    }

    const body = await request.json();
    const { project_slug, shipping_info, cart_items } = body;

    // Validate required fields
    if (!project_slug || !shipping_info || !cart_items || cart_items.length === 0) {
      throw error(400, 'Missing required fields');
    }

    // Get project info
    const { data: project, error: projectError } = await supabase
      .from('projects_info')
      .select('id, name, url')
      .eq('url', project_slug)
      .single();

    if (projectError || !project) {
      throw error(404, 'Project not found');
    }

    // Get product details for cart items
    const productSkus = cart_items.map((item: any) => item.product_sku);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, currency, project_id, sku')
      .in('sku', productSkus);

    if (productsError || !products) {
      throw error(500, 'Failed to load product details');
    }

    // Filter cart items by project and calculate total
    const projectCartItems = cart_items
      .map((cartItem: any) => {
        const product = products.find(p => p.sku === cartItem.product_sku);
        if (product && product.project_id === project.id) {
          return { ...cartItem, product };
        }
        return null;
      })
      .filter((item: any) => item !== null);

    if (projectCartItems.length === 0) {
      throw error(400, 'No valid products found for this project');
    }

    // Calculate totals
    const subtotal = projectCartItems.reduce((total: number, item: any) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const shippingAmount = 0; // Free shipping for now
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Generate order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    if (isMockMode) {
      // Mock Stripe response
      const mockPaymentIntent = {
        id: 'pi_mock_' + Date.now(),
        client_secret: 'pi_mock_' + Date.now() + '_secret_mock',
        status: 'requires_payment_method'
      };

      // Create order with mock payment intent
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          order_number: orderNumber,
          status: 'pending',
          currency: 'USD',
          subtotal_amount: subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          payment_status: 'pending',
          stripe_payment_intent_id: mockPaymentIntent.id,
          shipping_address: shipping_info,
          ...shipping_info
        })
        .select()
        .single();

      if (orderError) {
        throw error(500, 'Failed to create order');
      }

      // Create order items
      const orderItems = projectCartItems.map((item: any) => ({
        order_id: order.id,
        product_sku: item.product_sku,
        product_name: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.product.price)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Cleanup order if items failed
        await supabase.from('orders').delete().eq('id', order.id);
        throw error(500, 'Failed to create order items');
      }

      return json({
        success: true,
        mock_mode: true,
        client_secret: mockPaymentIntent.client_secret,
        order: {
          id: order.id,
          order_number: orderNumber,
          total_amount: totalAmount,
          currency: 'USD'
        }
      });
    }

    // Real Stripe integration
    if (!stripe) {
      throw error(500, 'Stripe not configured');
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        project_slug,
        order_number: orderNumber,
        user_id: session.user.id,
        project_id: project.id.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create order with payment intent
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        order_number: orderNumber,
        status: 'pending',
        currency: 'USD',
        subtotal_amount: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        payment_status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        shipping_address: shipping_info,
        ...shipping_info
      })
      .select()
      .single();

    if (orderError) {
      // Cancel the payment intent if order creation failed
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw error(500, 'Failed to create order');
    }

    // Create order items
    const orderItems = projectCartItems.map((item: any) => ({
      order_id: order.id,
      product_sku: item.product_sku,
      product_name: item.product.name,
      quantity: item.quantity,
      price: parseFloat(item.product.price)
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Cleanup order and cancel payment intent if items failed
      await supabase.from('orders').delete().eq('id', order.id);
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw error(500, 'Failed to create order items');
    }

    return json({
      success: true,
      client_secret: paymentIntent.client_secret,
      order: {
        id: order.id,
        order_number: orderNumber,
        total_amount: totalAmount,
        currency: 'USD'
      }
    });

  } catch (err) {
    console.error('Checkout API error:', err);
    if (err instanceof Response) {
      throw err;
    }
    throw error(500, 'Internal server error');
  }
}; 