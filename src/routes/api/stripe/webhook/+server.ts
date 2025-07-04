import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
let stripe: Stripe | null = null;

if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY !== 'sk_test_your_secret_key_here') {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
  });
}

// Initialize Supabase with service role
const supabase = createClient(
  env.PUBLIC_SUPABASE_URL || '',
  env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const POST: RequestHandler = async ({ request }) => {
  if (!stripe) {
    console.log('Webhook called but Stripe not configured - ignoring');
    return json({ received: true });
  }

  const sig = request.headers.get('stripe-signature');
  const endpointSecret = env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // Skip webhook verification for development/testing
  if (!sig || !endpointSecret) {
    console.log('Webhook signature verification skipped - using raw body');
    try {
      const body = await request.json();
      event = body as Stripe.Event;
    } catch (err) {
      console.error('Failed to parse webhook body:', err);
      throw error(400, 'Invalid webhook body');
    }
  } else {
    // Use proper webhook verification when secret is available
    try {
      const body = await request.text();
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw error(400, 'Invalid signature');
    }
  }

  console.log('Received webhook event:', event.type);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return json({ received: true });
};

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);

    // Update order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select()
      .single();

    if (orderError) {
      console.error('Failed to update order:', orderError);
      return;
    }

    if (!order) {
      console.error('No order found for payment intent:', paymentIntent.id);
      return;
    }

    console.log('Order updated successfully:', order.order_number);

    // Clear cart items for this user and project
    if (paymentIntent.metadata.user_id && paymentIntent.metadata.project_id) {
      // Get cart items for this user that belong to this project
      const { data: cartItems, error: cartError } = await supabase
        .from('cart')
        .select('id, product_sku')
        .eq('user_id', paymentIntent.metadata.user_id);

      if (!cartError && cartItems) {
        // Get products for this project
        const { data: projectProducts, error: productsError } = await supabase
          .from('products')
          .select('sku')
          .eq('project_id', paymentIntent.metadata.project_id);

        if (!productsError && projectProducts) {
          const projectSkus = projectProducts.map(p => p.sku);
          const itemsToDelete = cartItems.filter(item => 
            projectSkus.includes(item.product_sku)
          ).map(item => item.id);

          if (itemsToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('cart')
              .delete()
              .in('id', itemsToDelete);

            if (deleteError) {
              console.error('Failed to clear cart:', deleteError);
            } else {
              console.log('Cart cleared for order:', order.order_number);
            }
          }
        }
      }
    }

    // TODO: Send confirmation email to customer
    // TODO: Send notification to admin

  } catch (err) {
    console.error('Error handling payment success:', err);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);

    // Update order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select()
      .single();

    if (orderError) {
      console.error('Failed to update failed order:', orderError);
      return;
    }

    if (!order) {
      console.error('No order found for failed payment:', paymentIntent.id);
      return;
    }

    console.log('Order marked as failed:', order.order_number);

    // TODO: Send failure notification to customer

  } catch (err) {
    console.error('Error handling payment failure:', err);
  }
} 