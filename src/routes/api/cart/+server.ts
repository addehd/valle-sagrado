import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
  try {
    // Get user session safely
    const { session } = await safeGetSession();

    if (!session?.user) {
      return json({
        items: [],
        summary: {
          itemCount: 0,
          subtotal: 0,
          currency: 'USD'
        }
      });
    }

    // Get current user's cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select('id, quantity, product_sku, created_at, updated_at')
      .eq('user_id', session.user.id);

    if (cartError) {
      console.error('Cart error:', cartError);
      return json({
        items: [],
        summary: {
          itemCount: 0,
          subtotal: 0,
          currency: 'USD'
        }
      });
    }

    if (!cartItems || cartItems.length === 0) {
      return json({
        items: [],
        summary: {
          itemCount: 0,
          subtotal: 0,
          currency: 'USD'
        }
      });
    }

    // Get all product details for the cart items
    const skus = cartItems.map(item => item.product_sku);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, images, slug, project_id, sku, currency')
      .in('sku', skus);

    if (productsError) {
      console.error('Products error:', productsError);
      return json({
        items: [],
        summary: {
          itemCount: 0,
          subtotal: 0,
          currency: 'USD'
        }
      });
    }

    // Combine cart items with product data
    const enrichedCartItems = cartItems.map(cartItem => {
      const product = products?.find(p => p.sku === cartItem.product_sku);
      return {
        ...cartItem,
        user_id: session.user.id,
        product: product ? {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          currency: product.currency || 'USD',
          images: product.images,
          slug: product.slug,
          project_id: product.project_id
        } : null
      };
    }).filter(item => item.product !== null); // Only include items with valid products

    // Calculate summary
    const itemCount = enrichedCartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = enrichedCartItems.reduce((total, item) => {
      return total + (item.product!.price * item.quantity);
    }, 0);

    return json({
      items: enrichedCartItems,
      summary: {
        itemCount,
        subtotal,
        currency: 'USD'
      }
    });

  } catch (err) {
    console.error('Error in cart API:', err);
    return error(500, 'Failed to load cart');
  }
};

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  try {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, 'Must be logged in');
    }

    const { product_sku, quantity } = await request.json();

    if (!product_sku || !quantity || quantity < 1) {
      return error(400, 'Product SKU and valid quantity are required');
    }

    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('product_sku', product_sku)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing item:', existingError);
      return error(500, 'Failed to check cart');
    }

    if (existingItem) {
      // Update quantity
      const { error: updateError } = await supabase
        .from('cart')
        .update({ 
          quantity: quantity, // Set to specific quantity, not add
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error('Error updating cart item:', updateError);
        return error(500, 'Failed to update cart');
      }
    } else {
      // Add new item
      const { error: insertError } = await supabase
        .from('cart')
        .insert({
          user_id: session.user.id,
          product_sku,
          quantity
        });

      if (insertError) {
        console.error('Error inserting cart item:', insertError);
        return error(500, 'Failed to add to cart');
      }
    }

    // Return updated cart
    return GET({ locals: { supabase, safeGetSession } } as any);

  } catch (err) {
    console.error('Error in cart API POST:', err);
    return error(500, 'Failed to update cart');
  }
};

export const DELETE: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  try {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, 'Must be logged in');
    }

    const body = await request.json();
    
    if (body.clear_all) {
      // Clear entire cart
      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', session.user.id);

      if (deleteError) {
        console.error('Error clearing cart:', deleteError);
        return error(500, 'Failed to clear cart');
      }
    } else if (body.product_sku) {
      // Remove specific item
      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', session.user.id)
        .eq('product_sku', body.product_sku);

      if (deleteError) {
        console.error('Error removing cart item:', deleteError);
        return error(500, 'Failed to remove item from cart');
      }
    } else {
      return error(400, 'Must specify either clear_all or product_sku');
    }

    // Return updated cart
    return GET({ locals: { supabase, safeGetSession } } as any);

  } catch (err) {
    console.error('Error in cart API DELETE:', err);
    return error(500, 'Failed to delete from cart');
  }
}; 