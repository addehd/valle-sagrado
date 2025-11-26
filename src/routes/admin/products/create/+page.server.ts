import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { supabase, safeGetSession } = locals;
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(302, `/auth?redirect=/admin/products/create`);
	}

	// Get all projects this user is admin of
	const { data: adminProjects, error: adminError } = await supabase
		.from('project_admins')
		.select(`
			project_id,
			role,
			projects_info (
				id,
				name,
				url
			)
		`)
		.eq('user_id', session.user.id);

	if (adminError || !adminProjects || adminProjects.length === 0) {
		throw error(403, 'You must be a project admin to create products');
	}

	return {
		adminProjects
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { supabase, safeGetSession } = locals;
		const { session } = await safeGetSession();

		if (!session) {
			throw redirect(302, `/auth?redirect=/admin/products/create`);
		}

		const formData = await request.formData();
		const projectId = parseInt(formData.get('project_id') as string);
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const price = parseFloat(formData.get('price') as string);
		const image_url = formData.get('image_url') as string;
		const category = formData.get('category') as string;

		if (!projectId) {
			return fail(400, { error: 'Project selection is required' });
		}

		// Verify user is admin of the selected project
		const { data: isAdmin } = await supabase.rpc('is_project_admin', {
			user_id: session.user.id,
			project_id: projectId
		});

		if (!isAdmin) {
			return fail(403, { error: 'You must be a project admin to create products for this project' });
		}

		// Get project info for redirect
		const { data: project } = await supabase
			.from('projects_info')
			.select('url')
			.eq('id', projectId)
			.single();

		// Generate URL slug from name
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();

		const { data, error } = await supabase
			.from('products')
			.insert({
				name,
				description,
				price,
				image_url,
				category,
				slug,
				project_id: projectId,
				created_by: session.user.id
			})
			.select()
			.single();

		if (error) {
			console.error('Error creating product:', error);
			return fail(500, { error: 'Failed to create product' });
		}

		// Redirect to the project's product page
		if (project) {
			throw redirect(303, `/${project.url}/product/${slug}`);
		} else {
			throw redirect(303, `/admin/products`);
		}
	}
}; 