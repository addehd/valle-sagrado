import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase, user } }) => {
	try {
		// Require admin authentication
		requireAdmin(user);

		const searchParams = url.searchParams;
		const status = searchParams.get('status');
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');

		let query = supabase
			.from('orders')
			.select('*')
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		// Apply status filter if provided
		if (status && status !== 'all') {
			query = query.eq('status', status);
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching orders:', error);
			return json({ error: 'Failed to fetch orders' }, { status: 500 });
		}

		return json(data || []);
	} catch (error) {
		console.error('Error in orders API:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 