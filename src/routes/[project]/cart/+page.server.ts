import type { PageServerLoad, Actions } from './$types';
import { fail, error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
	try {
		// Get user session safely
		const { session } = await safeGetSession();

		if (!session?.user) {
			return {
				cartItems: [],
				project: null,
				total: 0
			};
		}

		const projectSlug = params.project;

		// Get project info using projects_info table
		const { data: project, error: projectError } = await supabase
			.from('projects_info')
			.select('id, name, url')
			.eq('url', projectSlug)
			.single();

		if (projectError || !project) {
			throw error(404, 'Project not found');
		}

		// Get current user's cart items
		const { data: cartItems, error: cartError } = await supabase
			.from('cart')
			.select('id, quantity, product_sku')
			.eq('user_id', session.user.id);

		console.log('Cart items raw:', { cartItems, cartError });

		if (cartError || !cartItems) {
			console.error('Cart error:', cartError);
			return {
				project,
				cartItems: [],
				totalAmount: 0
			};
		}

		// Get all product details for the cart items
		const skus = cartItems.map(item => item.product_sku);
		const { data: products, error: productsError } = await supabase
			.from('products')
			.select('id, name, price, images, slug, project_id, sku')
			.in('sku', skus);

		console.log('Products for cart:', { products, productsError });

		if (productsError) {
			console.error('Products error:', productsError);
			return {
				project,
				cartItems: [],
				totalAmount: 0
			};
		}

		// Combine cart items with product data and filter by project
		const projectCartItems = cartItems
			.map(cartItem => {
				const product = products?.find(p => p.sku === cartItem.product_sku);
				if (product && product.project_id === project.id) {
					return {
						...cartItem,
						products: product
					};
				}
				return null;
			})
			.filter(item => item !== null);

		console.log('Final project cart items:', projectCartItems);

		// Calculate total amount
		const totalAmount = projectCartItems.reduce((total, item) => {
			return total + (parseFloat(item.products.price) * item.quantity);
		}, 0);

		return {
			project,
			cartItems: projectCartItems,
			totalAmount
		};
	} catch (error) {
		console.error('Error loading cart:', error);
		return {
			cartItems: [],
			project: null,
			total: 0
		};
	}
};

export const actions: Actions = {
  addToCart: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return fail(401, { error: 'Must be logged in to add items to cart' });
    }

    const data = await request.formData();
    const productSku = data.get('product_sku') as string;
    const quantity = parseInt(data.get('quantity') as string) || 1;

    if (!productSku) {
      return fail(400, { error: 'Product SKU is required' });
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('product_sku', productSku)
      .single();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from('cart')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (error) {
        return fail(500, { error: 'Failed to update cart' });
      }
    } else {
      // Add new item
      const { error } = await supabase
        .from('cart')
        .insert({
          user_id: session.user.id,
          product_sku: productSku,
          quantity
        });

      if (error) {
        return fail(500, { error: 'Failed to add to cart' });
      }
    }

    return { success: true, message: 'Added to cart successfully' };
  },

  removeFromCart: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return fail(401, { error: 'Must be logged in' });
    }

    const data = await request.formData();
    const cartItemId = data.get('cart_item_id') as string;

    if (!cartItemId) {
      return fail(400, { error: 'Cart item ID is required' });
    }

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', session.user.id); // Ensure user can only delete their own items

    if (error) {
      return fail(500, { error: 'Failed to remove item from cart' });
    }

    return { success: true, message: 'Item removed from cart' };
  },

  updateQuantity: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return fail(401, { error: 'Must be logged in' });
    }

    const data = await request.formData();
    const cartItemId = data.get('cart_item_id') as string;
    const quantity = parseInt(data.get('quantity') as string);

    if (!cartItemId || !quantity || quantity < 1) {
      return fail(400, { error: 'Valid cart item ID and quantity are required' });
    }

    const { error } = await supabase
      .from('cart')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .eq('user_id', session.user.id); // Ensure user can only update their own items

    if (error) {
      return fail(500, { error: 'Failed to update quantity' });
    }

    return { success: true, message: 'Quantity updated' };
  },

  clearCart: async ({ params, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    const projectSlug = params.project;
    
    if (!session?.user) {
      return fail(401, { error: 'Must be logged in' });
    }

    // Get project ID for filtering
    const { data: projectData } = await supabase
      .from('projects')
      .select('id')
      .eq('url_slug', projectSlug)
      .single();

    if (!projectData) {
      return fail(404, { error: 'Project not found' });
    }

    // Get product SKUs for this project
    const { data: products } = await supabase
      .from('products')
      .select('sku')
      .eq('project_id', projectData.id);

    if (!products || products.length === 0) {
      return { success: true, message: 'No items to clear' };
    }

    const skus = products.map(p => p.sku);

    // Clear only cart items for this project
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', session.user.id)
      .in('product_sku', skus);

    if (error) {
      return fail(500, { error: 'Failed to clear cart' });
    }

    return { success: true, message: 'Cart cleared successfully' };
  }
}; 