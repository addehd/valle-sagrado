import { requireAdmin } from '$lib/admin';
import { error } from '@sveltejs/kit';

export const load = async ({ locals, params }: any) => {
	// Require admin authentication for all admin routes
	requireAdmin(locals.user);

	const projectSlug = params.project;

	// Fetch the project by URL slug
	const { data: project, error: projectError } = await locals.supabase
		.from('projects_info')
		.select('id, name, url')
		.eq('url', projectSlug)
		.single();

	if (projectError || !project) {
		console.error('Error fetching project:', projectError);
		throw error(404, 'Project not found');
	}

	// Verify user has admin access to this project
	const { data: adminAccess, error: adminError } = await locals.supabase
		.from('project_admins')
		.select('role')
		.eq('user_id', locals.user.id)
		.eq('project_id', project.id)
		.single();

	if (adminError || !adminAccess) {
		// Check if user is super_admin (they have access to all projects)
		const isSuperAdmin = locals.user?.app_metadata?.role === 'super_admin';
		if (!isSuperAdmin) {
			throw error(403, 'You do not have admin access to this project');
		}
	}

	return {
		session: locals.session,
		user: locals.user,
		project
	};
};
