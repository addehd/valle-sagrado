import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals: { supabase, user } }) => {
	try {
		// Require admin authentication
		requireAdmin(user);

		const { id } = params;

		const { data: order, error: orderError } = await supabase
			.from('orders')
			.select('*')
			.eq('id', id)
			.single();

		if (orderError) {
			console.error('Error fetching order:', orderError);
			return json({ error: 'Order not found' }, { status: 404 });
		}

		// Get order items
		const { data: orderItems, error: itemsError } = await supabase
			.from('order_items')
			.select('*')
			.eq('order_id', id);

		if (itemsError) {
			console.error('Error fetching order items:', itemsError);
			return json({ error: 'Failed to fetch order items' }, { status: 500 });
		}

		return json({
			...order,
			items: orderItems || []
		});
	} catch (error) {
		console.error('Error in order API:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, request, locals: { supabase, user } }) => {
	try {
		// Require admin authentication
		requireAdmin(user);

		const { id } = params;
		const body = await request.json();
		
		// Validate allowed fields
		const allowedFields = ['status', 'shipped_at', 'delivered_at'];
		const updateData: any = {};
		
		for (const [key, value] of Object.entries(body)) {
			if (allowedFields.includes(key)) {
				updateData[key] = value;
			}
		}

		// Add timestamp for status changes
		if (body.status === 'shipped' && !updateData.shipped_at) {
			updateData.shipped_at = new Date().toISOString();
		}
		
		if (body.status === 'delivered' && !updateData.delivered_at) {
			updateData.delivered_at = new Date().toISOString();
		}

		// Add updated_at timestamp
		updateData.updated_at = new Date().toISOString();

		const { data, error } = await supabase
			.from('orders')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating order:', error);
			return json({ error: 'Failed to update order' }, { status: 500 });
		}

		return json(data);
	} catch (error) {
		console.error('Error in order update API:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 