import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase, user, safeGetSession } }) => {
	try {
		// Get the current session and user
		const { session, user: sessionUser } = await safeGetSession();
		const currentUser = user || sessionUser;
		
		// Require admin authentication
		if (!currentUser) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}
		
		requireAdmin(currentUser);

		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const status = url.searchParams.get('status');
		const search = url.searchParams.get('search');
		
		const offset = (page - 1) * limit;

		// Get the user's project(s) through RPC function to bypass RLS restrictions
		const { data: adminProjects, error: adminError } = await supabase.rpc('get_user_projects', {
			user_id_param: currentUser.id
		});

		if (adminError) {
			console.error('Error fetching user projects:', adminError);
			return json({ error: 'Failed to fetch user projects' }, { status: 500 });
		}

		if (!adminProjects || adminProjects.length === 0) {
			console.log('User has no associated projects');
			return json({
				products: [],
				total: 0,
				page,
				limit,
				totalPages: 0,
				project: null,
				message: 'No project associated with your account. Please contact an administrator to assign you to a project.'
			});
		}

		// For now, use the first project the user is admin of
		// TODO: In the future, you might want to add project selection UI
		const userProject = adminProjects[0];
		const project = {
			id: userProject.id,
			name: userProject.name,
			url: userProject.url
		};

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