import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, session, user } }) => {
	try {
		// Require admin authentication
		requireAdmin(user);

		// Get product stats
		const { data: productStats, error: productError } = await supabase
			.rpc('get_product_stats');

		if (productError) {
			console.error('Product stats error:', productError);
		}

		// Get order stats  
		const { data: orderStats, error: orderError } = await supabase
			.rpc('get_order_stats');

		if (orderError) {
			console.error('Order stats error:', orderError);
		}

		// Get stock alerts
		const { data: stockData, error: stockError } = await supabase
			.from('products')
			.select('stock_quantity, track_inventory')
			.eq('is_active', true)
			.eq('track_inventory', true)
			.lte('stock_quantity', 10); // Low stock threshold

		if (stockError) {
			console.error('Stock stats error:', stockError);
		}

		// Fallback to simple queries if RPC functions don't exist
		let totalProducts = 0;
		let activeProducts = 0;
		let draftProducts = 0;
		let totalOrders = 0;
		let pendingOrders = 0;

		if (!productStats) {
			const { count: totalCount } = await supabase
				.from('products')
				.select('*', { count: 'exact', head: true });
			
			const { count: activeCount } = await supabase
				.from('products')
				.select('*', { count: 'exact', head: true })
				.eq('status', 'active');
			
			const { count: draftCount } = await supabase
				.from('products')
				.select('*', { count: 'exact', head: true })
				.eq('status', 'draft');

			totalProducts = totalCount || 0;
			activeProducts = activeCount || 0;
			draftProducts = draftCount || 0;
		} else {
			totalProducts = productStats.total_products || 0;
			activeProducts = productStats.active_products || 0;
			draftProducts = productStats.draft_products || 0;
		}

		if (!orderStats) {
			const { count: totalOrderCount } = await supabase
				.from('orders')
				.select('*', { count: 'exact', head: true });
			
			const { count: pendingOrderCount } = await supabase
				.from('orders')
				.select('*', { count: 'exact', head: true })
				.in('status', ['pending', 'processing', 'confirmed']);

			totalOrders = totalOrderCount || 0;
			pendingOrders = pendingOrderCount || 0;
		} else {
			totalOrders = orderStats.total_orders || 0;
			pendingOrders = orderStats.pending_orders || 0;
		}

		const lowStockAlerts = stockData?.length || 0;

		return json({
			totalProducts,
			activeProducts,
			draftProducts,
			totalOrders,
			pendingOrders,
			lowStockAlerts
		});

	} catch (error) {
		console.error('Dashboard stats error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 