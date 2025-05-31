import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { requireSuperAdmin, setUserRole, listAdminUsers } from '$lib/admin';
import { env } from '$env/dynamic/private';

// Create admin client for user management
const adminSupabase = createClient(
	env.PUBLIC_SUPABASE_URL!,
	env.SUPABASE_SERVICE_ROLE_KEY!
);

export const GET = async ({ url, locals }: any) => {
	try {
		// Require super admin authentication
		requireSuperAdmin(locals.user);

		const listType = url.searchParams.get('type') || 'all';

		if (listType === 'admins') {
			// List only admin users
			const adminUsers = await listAdminUsers(adminSupabase);
			return json(adminUsers);
		} else {
			// List all users
			const { data, error } = await adminSupabase.auth.admin.listUsers();
			
			if (error) {
				console.error('Error listing users:', error);
				return json({ error: 'Failed to fetch users' }, { status: 500 });
			}

			return json(data.users);
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

		const result = await setUserRole(adminSupabase, userId, role);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json({ success: true, message: 'User role updated successfully' });
	} catch (error) {
		console.error('Error updating user role:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 