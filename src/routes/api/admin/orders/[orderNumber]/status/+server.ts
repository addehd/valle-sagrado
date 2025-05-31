import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request, locals: { supabase, session } }) => {
	try {
		// Check if user is authenticated
		if (!session?.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// TODO: Add admin role check
		// For now, allow any authenticated user (in production, check for admin role)
		
		const { orderNumber } = params;
		const { status, tracking_number, shipped_at, delivered_at } = await request.json();

		if (!orderNumber) {
			return json({ error: 'Order number is required' }, { status: 400 });
		}

		if (!status) {
			return json({ error: 'Status is required' }, { status: 400 });
		}

		// Validate status
		const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
		if (!validStatuses.includes(status)) {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		// Build update object
		const updateData: any = {
			status,
			updated_at: new Date().toISOString()
		};

		// Add optional fields if provided
		if (tracking_number) {
			updateData.tracking_number = tracking_number;
		}

		if (shipped_at && status === 'shipped') {
			updateData.shipped_at = shipped_at;
		}

		if (delivered_at && status === 'delivered') {
			updateData.delivered_at = delivered_at;
		}

		// If setting to shipped and no shipped_at provided, set current timestamp
		if (status === 'shipped' && !updateData.shipped_at) {
			updateData.shipped_at = new Date().toISOString();
		}

		// If setting to delivered and no delivered_at provided, set current timestamp
		if (status === 'delivered' && !updateData.delivered_at) {
			updateData.delivered_at = new Date().toISOString();
		}

		// Update the order
		const { data: order, error } = await supabase
			.from('orders')
			.update(updateData)
			.eq('order_number', orderNumber)
			.select()
			.single();

		if (error) {
			console.error('Order status update error:', error);
			return json({ error: 'Failed to update order status' }, { status: 500 });
		}

		if (!order) {
			return json({ error: 'Order not found' }, { status: 404 });
		}

		return json({ 
			message: 'Order status updated successfully',
			order 
		});

	} catch (error) {
		console.error('Order status update API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 