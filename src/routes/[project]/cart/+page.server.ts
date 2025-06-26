import type { PageServerLoad, Actions } from './$types';
import { fail, error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
	try {
		// Get user session safely
		const { session } = await safeGetSession();

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

		if (!session?.user) {
			return {
				cartItems: [],
				project,
				totalAmount: 0,
				summary: {
					itemCount: 0,
					subtotal: 0,
					currency: 'USD'
				}
			};
		}

		// Get current user's cart items with enhanced selection
		const { data: cartItems, error: cartError } = await supabase
			.from('cart')
			.select('id, quantity, product_sku, created_at, updated_at')
			.eq('user_id', session.user.id);

		if (cartError || !cartItems || cartItems.length === 0) {
			console.error('Cart error:', cartError);
			return {
				project,
				cartItems: [],
				totalAmount: 0,
				summary: {
					itemCount: 0,
					subtotal: 0,
					currency: 'USD'
				}
			};
		}

		// Get all product details for the cart items
		const skus = cartItems.map(item => item.product_sku);
		const { data: products, error: productsError } = await supabase
			.from('products')
			.select('id, name, price, images, slug, project_id, sku, currency')
			.in('sku', skus);

		if (productsError || !products) {
			console.error('Products error:', productsError);
			return {
				project,
				cartItems: [],
				totalAmount: 0,
				summary: {
					itemCount: 0,
					subtotal: 0,
					currency: 'USD'
				}
			};
		}

		// Combine cart items with product data and filter by project
		const enrichedCartItems = cartItems
			.map(cartItem => {
				const product = products?.find(p => p.sku === cartItem.product_sku);
				if (product && product.project_id === project.id) {
					return {
						...cartItem,
						user_id: session.user.id,
						products: product,
						product: {
							id: product.id,
							name: product.name,
							price: parseFloat(product.price),
							currency: product.currency || 'USD',
							images: product.images,
							slug: product.slug,
							project_id: product.project_id
						},
						currentPrice: parseFloat(product.price),
						itemTotal: parseFloat(product.price) * cartItem.quantity,
						isAvailable: true
					};
				}
				return null;
			})
			.filter(item => item !== null);

		// Calculate summary
		const itemCount = enrichedCartItems.reduce((total, item) => total + item.quantity, 0);
		const subtotal = enrichedCartItems.reduce((total, item) => {
			return total + (item.product.price * item.quantity);
		}, 0);

		return {
			project,
			cartItems: enrichedCartItems,
			totalAmount: subtotal,
			summary: {
				itemCount,
				subtotal,
				currency: 'USD'
			}
		};
	} catch (error) {
		console.error('Error loading cart:', error);
		return {
			cartItems: [],
			project: null,
			totalAmount: 0,
			summary: {
				itemCount: 0,
				subtotal: 0,
				currency: 'USD'
			}
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

    // Get project ID for filtering - use projects_info table like the load function
    const { data: projectData } = await supabase
      .from('projects_info')
      .select('id')
      .eq('url', projectSlug)
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
      console.error('Clear cart error:', error);
      return fail(500, { error: 'Failed to clear cart' });
    }

    return { success: true, message: 'Cart cleared successfully' };
  }
}; 