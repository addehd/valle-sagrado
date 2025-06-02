import { requireAdmin } from '$lib/admin';

export const load = async ({ locals }: any) => {
	// Require admin authentication for all admin routes
	requireAdmin(locals.user);

	// Fetch current project info (assuming single project for now)
	// TODO: In multi-project setup, this could be based on subdomain or user preference
	const { data: project, error: projectError } = await locals.supabase
		.from('projects_info')
		.select('*')
		.single();

	if (projectError) {
		console.error('Error fetching project info:', projectError);
	}

	return {
		session: locals.session,
		user: locals.user,
		project: project || null
	};
}; 