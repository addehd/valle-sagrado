import { requireAdmin } from '$lib/admin';

export const load = async ({ locals }: any) => {
	// Require admin authentication for all admin routes
	requireAdmin(locals.user);

	return {
		session: locals.session,
		user: locals.user
	};
}; 