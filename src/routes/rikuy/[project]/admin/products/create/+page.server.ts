import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { supabase, safeGetSession } = locals;
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(302, `/auth?redirect=/rikuy/${params.project}/admin/products/create`);
	}

	const projectSlug = params.project;

	// Fetch the project by URL slug
	const { data: project, error: projectError } = await supabase
		.from('projects_info')
		.select('id, name, url')
		.eq('url', projectSlug)
		.single();

	if (projectError || !project) {
		throw error(404, 'Project not found');
	}

	// Verify user has admin access to this project
	const { data: adminAccess, error: adminError } = await supabase
		.from('project_admins')
		.select('role')
		.eq('user_id', session.user.id)
		.eq('project_id', project.id)
		.single();

	const isSuperAdmin = session.user?.app_metadata?.role === 'super_admin';
	if ((adminError || !adminAccess) && !isSuperAdmin) {
		throw error(403, 'You must be a project admin to create products');
	}

	return {
		project
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const { supabase, safeGetSession } = locals;
		const { session } = await safeGetSession();

		if (!session) {
			throw redirect(302, `/auth?redirect=/rikuy/${params.project}/admin/products/create`);
		}

		const projectSlug = params.project;

		// Fetch the project by URL slug
		const { data: project, error: projectError } = await supabase
			.from('projects_info')
			.select('id, name, url')
			.eq('url', projectSlug)
			.single();

		if (projectError || !project) {
			return fail(404, { error: 'Project not found' });
		}

		// Verify user is admin of the project
		const { data: isAdmin } = await supabase.rpc('is_project_admin', {
			user_id: session.user.id,
			project_id: project.id
		});

		const isSuperAdmin = session.user?.app_metadata?.role === 'super_admin';
		if (!isAdmin && !isSuperAdmin) {
			return fail(403, { error: 'You must be a project admin to create products for this project' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const price = parseFloat(formData.get('price') as string);
		const image_url = formData.get('image_url') as string;
		const category = formData.get('category') as string;

		// Generate URL slug from name
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();

		const { data, error: insertError } = await supabase
			.from('products')
			.insert({
				name,
				description,
				price,
				image_url,
				category,
				slug,
				project_id: project.id,
				created_by: session.user.id
			})
			.select()
			.single();

		if (insertError) {
			console.error('Error creating product:', insertError);
			return fail(500, { error: 'Failed to create product' });
		}

		// Redirect to the project's product page
		throw redirect(303, `/rikuy/${project.url}/product/${slug}`);
	}
};
