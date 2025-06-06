import { json } from '@sveltejs/kit';
import { requireSuperAdmin, setUserRole, listAdminUsers } from '$lib/admin';

export const GET = async ({ url, locals }: any) => {
	try {
		// Require super admin authentication
		requireSuperAdmin(locals.user);

		const listType = url.searchParams.get('type') || 'all';

		if (listType === 'admins') {
			// List only admin users - using locals.supabase per project rules
			const adminUsers = await listAdminUsers(locals.supabase);
			return json(adminUsers);
		} else {
			// List all users - this might need service role key for full admin access
			// For now, return empty array or redirect to admin-only endpoint
			return json({ error: 'Full user listing requires service role access' }, { status: 403 });
		}
	} catch (error) {
		console.error('Error in users API:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PATCH = async ({ request, locals }: any) => {
	try {
		// Require super admin authentication
		requireSuperAdmin(locals.user);

		const { userId, role } = await request.json();

		if (!userId || !role) {
			return json({ error: 'User ID and role are required' }, { status: 400 });
		}

		// Validate role
		const validRoles = ['user', 'admin', 'super_admin'];
		if (!validRoles.includes(role)) {
			return json({ error: 'Invalid role' }, { status: 400 });
		}

		// Prevent removing super admin role from yourself
		if (locals.user?.id === userId && role !== 'super_admin') {
			return json({ error: 'Cannot remove super admin role from yourself' }, { status: 400 });
		}

		// Using locals.supabase per project rules - note: role updates might need service key
		const result = await setUserRole(locals.supabase, userId, role);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json({ success: true, message: 'User role updated successfully' });
	} catch (error) {
		console.error('Error updating user role:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 