import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase, session, user } }) => {
	try {
		// Require admin authentication
		requireAdmin(user);

		console.log('Admin products API called');

		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const status = url.searchParams.get('status');
		const search = url.searchParams.get('search');
		
		const offset = (page - 1) * limit;

		// Get current project info to filter products
		const { data: project, error: projectError } = await supabase
			.from('projects_info')
			.select('id')
			.single();

		if (projectError || !project) {
			console.error('Error fetching project info:', projectError);
			return json({ error: 'Project not found' }, { status: 404 });
		}

		let query = supabase
			.from('products')
			.select(`
				sku,
				slug,
				name,
				brand,
				description,
				price,
				sale_price,
				sale_start,
				sale_end,
				currency,
				stock,
				status,
				images,
				created_at,
				updated_at,
				project_id
			`)
			.eq('project_id', project.id)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		// Apply filters
		if (status && status !== 'all') {
			query = query.eq('status', status);
		}

		if (search && search.trim()) {
			query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
		}

		const { data: products, error: productsError } = await query;

		if (productsError) {
			console.error('Products fetch error:', productsError);
			return json({ error: 'Failed to fetch products' }, { status: 500 });
		}

		// Get total count for pagination
		let countQuery = supabase
			.from('products')
			.select('*', { count: 'exact', head: true })
			.eq('project_id', project.id);

		if (status && status !== 'all') {
			countQuery = countQuery.eq('status', status);
		}

		if (search && search.trim()) {
			countQuery = countQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
		}

		const { count, error: countError } = await countQuery;

		if (countError) {
			console.error('Count error:', countError);
		}

		return json({
			products: products || [],
			total: count || 0,
			page,
			limit,
			totalPages: Math.ceil((count || 0) / limit),
			project: project
		});

	} catch (error) {
		console.error('Admin products API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 