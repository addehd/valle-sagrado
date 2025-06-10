import type { PageServerLoad, Actions } from './$types';
import { fail, error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
	try {
		// Get user session safely
		const { session } = await safeGetSession();

		if (!session?.user) {
			// Redirect to login if not authenticated
			throw redirect(302, '/login');
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

		if (cartError) {
			console.error('Cart error:', cartError);
			return {
				project,
				cartItems: [],
				totalAmount: 0,
				session
			};
		}

		if (!cartItems || cartItems.length === 0) {
			// Redirect to cart if empty
			throw redirect(302, `/${projectSlug}/cart`);
		}

		// Get all product details for the cart items
		const skus = cartItems.map(item => item.product_sku);
		const { data: products, error: productsError } = await supabase
			.from('products')
			.select('id, name, price, images, slug, project_id, sku, currency')
			.in('sku', skus);

		if (productsError) {
			console.error('Products error:', productsError);
			return {
				project,
				cartItems: [],
				totalAmount: 0,
				session
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

		// Calculate total amount
		const totalAmount = projectCartItems.reduce((total, item) => {
			return total + (parseFloat(item.products.price) * item.quantity);
		}, 0);

		// Calculate totals
		const subtotal = totalAmount;
		const shippingCost = 0; // You can implement shipping logic here
		const taxRate = 0.08; // 8% tax - adjust as needed
		const taxAmount = subtotal * taxRate;
		const finalTotal = subtotal + shippingCost + taxAmount;

		return {
			project,
			cartItems: projectCartItems,
			subtotal,
			shippingCost,
			taxAmount,
			totalAmount: finalTotal,
			session
		};
	} catch (err) {
		if (err instanceof Response) {
			throw err; // Re-throw redirects and errors
		}
		console.error('Error loading checkout:', err);
		throw error(500, 'Failed to load checkout');
	}
};

export const actions: Actions = {
	placeOrder: async ({ request, params, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		
		if (!session?.user) {
			return fail(401, { error: 'Must be logged in' });
		}

		const projectSlug = params.project;
		
		// Get project info
		const { data: project, error: projectError } = await supabase
			.from('projects_info')
			.select('id, name, url')
			.eq('url', projectSlug)
			.single();

		if (projectError || !project) {
			return fail(404, { error: 'Project not found' });
		}

		const data = await request.formData();
		const shippingName = data.get('shipping_name') as string;
		const shippingEmail = data.get('shipping_email') as string;
		const shippingPhone = data.get('shipping_phone') as string;
		const shippingAddress1 = data.get('shipping_address_line1') as string;
		const shippingAddress2 = data.get('shipping_address_line2') as string;
		const shippingCity = data.get('shipping_city') as string;
		const shippingState = data.get('shipping_state') as string;
		const shippingPostalCode = data.get('shipping_postal_code') as string;
		const shippingCountry = data.get('shipping_country') as string;

		// Basic validation
		if (!shippingName || !shippingEmail || !shippingAddress1 || !shippingCity || !shippingState || !shippingPostalCode) {
			return fail(400, { error: 'Please fill in all required shipping fields' });
		}

		// Get cart items to create order
		const { data: cartItems, error: cartError } = await supabase
			.from('cart')
			.select('id, quantity, product_sku')
			.eq('user_id', session.user.id);

		if (cartError || !cartItems || cartItems.length === 0) {
			return fail(400, { error: 'Cart is empty' });
		}

		// Get product details
		const skus = cartItems.map(item => item.product_sku);
		const { data: products, error: productsError } = await supabase
			.from('products')
			.select('id, name, price, currency, project_id, sku')
			.in('sku', skus);

		if (productsError || !products) {
			return fail(500, { error: 'Failed to load product details' });
		}

		// Filter cart items by project and calculate total
		const projectCartItems = cartItems
			.map(cartItem => {
				const product = products.find(p => p.sku === cartItem.product_sku);
				if (product && product.project_id === project.id) {
					return { ...cartItem, product };
				}
				return null;
			})
			.filter(item => item !== null);

		const subtotal = projectCartItems.reduce((total, item) => {
			return total + (parseFloat(item.product.price) * item.quantity);
		}, 0);

		const taxAmount = subtotal * 0.08; // 8% tax
		const totalAmount = subtotal + taxAmount;

		// Generate order number
		const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

		try {
			// Create order
			const { data: order, error: orderError } = await supabase
				.from('orders')
				.insert({
					user_id: session.user.id,
					order_number: orderNumber,
					status: 'pending',
					currency: 'USD',
					subtotal_amount: subtotal,
					tax_amount: taxAmount,
					shipping_amount: 0,
					total_amount: totalAmount,
					payment_status: 'pending',
					shipping_name: shippingName,
					shipping_email: shippingEmail,
					shipping_phone: shippingPhone,
					shipping_address_line1: shippingAddress1,
					shipping_address_line2: shippingAddress2,
					shipping_city: shippingCity,
					shipping_state: shippingState,
					shipping_postal_code: shippingPostalCode,
					shipping_country: shippingCountry
				})
				.select()
				.single();

			if (orderError) {
				console.error('Order creation error:', orderError);
				return fail(500, { error: 'Failed to create order' });
			}

			// Create order items
			const orderItems = projectCartItems.map(item => ({
				order_id: order.id,
				product_sku: item.product_sku,
				product_name: item.product.name,
				quantity: item.quantity,
				unit_price: parseFloat(item.product.price),
				total_price: parseFloat(item.product.price) * item.quantity
			}));

			const { error: itemsError } = await supabase
				.from('order_items')
				.insert(orderItems);

			if (itemsError) {
				console.error('Order items error:', itemsError);
				// Try to cleanup order if items failed
				await supabase.from('orders').delete().eq('id', order.id);
				return fail(500, { error: 'Failed to create order items' });
			}

			// Clear cart for this project
			const cartItemIds = projectCartItems.map(item => item.id);
			const { error: clearCartError } = await supabase
				.from('cart')
				.delete()
				.in('id', cartItemIds);

			if (clearCartError) {
				console.error('Clear cart error:', clearCartError);
				// Non-fatal error, order was created successfully
			}

			// Redirect to order confirmation or success page
			throw redirect(302, `/${projectSlug}/order-confirmation?order=${orderNumber}`);

		} catch (err) {
			if (err instanceof Response) {
				throw err; // Re-throw redirects
			}
			console.error('Order processing error:', err);
			return fail(500, { error: 'Failed to process order' });
		}
	}
}; 