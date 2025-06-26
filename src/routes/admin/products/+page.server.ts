import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/admin';

export const load: PageServerLoad = async ({ url, locals: { supabase, user, safeGetSession } }) => {
	try {
		// Get the current session and user
		const { session, user: sessionUser } = await safeGetSession();
		const currentUser = user || sessionUser;
		
		// Require admin authentication
		if (!currentUser) {
			return {
				products: [],
				total: 0,
				page: 1,
				limit: 50,
				totalPages: 0,
				project: null,
				error: 'Authentication required'
			};
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
			return {
				products: [],
				total: 0,
				page,
				limit,
				totalPages: 0,
				project: null,
				error: 'Failed to fetch user projects'
			};
		}

		if (!adminProjects || adminProjects.length === 0) {
			console.log('User has no associated projects');
			return {
				products: [],
				total: 0,
				page,
				limit,
				totalPages: 0,
				project: null,
				message: 'No project associated with your account. Please contact an administrator to assign you to a project.'
			};
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
			return {
				products: [],
				total: 0,
				page,
				limit,
				totalPages: 0,
				project,
				error: 'Failed to fetch products'
			};
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

		return {
			products: products || [],
			total: count || 0,
			page,
			limit,
			totalPages: Math.ceil((count || 0) / limit),
			project: project
		};

	} catch (error) {
		console.error('Admin products page error:', error);
		return {
			products: [],
			total: 0,
			page: 1,
			limit: 50,
			totalPages: 0,
			project: null,
			error: 'Internal server error'
		};
	}
};