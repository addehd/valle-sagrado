import { requireAdmin } from '$lib/admin';

export const load = async ({ locals }: any) => {
	// Require admin authentication for all admin routes
	requireAdmin(locals.user);

	// Fetch the user's project(s) through RPC function to bypass RLS restrictions
	const { data: adminProjects, error: projectError } = await locals.supabase.rpc('get_user_projects', {
		user_id_param: locals.user.id
	});

	let project = null;
	if (!projectError && adminProjects && adminProjects.length > 0) {
		// Use the first project the user is admin of
		const userProject = adminProjects[0];
		project = {
			id: userProject.id,
			name: userProject.name,
			url: userProject.url,
			// Add other fields if needed from the RPC result
		};
	} else if (projectError) {
		console.error('Error fetching user project info:', projectError);
	}

	return {
		session: locals.session,
		user: locals.user,
		project: project || null
	};
}; 