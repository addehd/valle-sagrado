import { json } from '@sveltejs/kit';
import { requireSuperAdmin } from '$lib/admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase, user } }) => {
	try {
		// Require super admin authentication
		requireSuperAdmin(user);

		const listType = url.searchParams.get('type') || 'all';

		if (listType === 'admins') {
			// Get project admin users from the project_admins table
			// This doesn't require service role access
			const { data: projectAdmins, error } = await supabase
				.from('project_admins')
				.select(`
					user_id,
					role,
					created_at,
					users!inner (
						id,
						email,
						created_at,
						last_sign_in_at
					)
				`)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error fetching project admins:', error);
				return json({ error: 'Failed to fetch admin users' }, { status: 500 });
			}

			// Transform the data to match the expected user format
			const adminUsers = projectAdmins?.map(admin => ({
				id: (admin.users as any).id,
				email: (admin.users as any).email,
				created_at: (admin.users as any).created_at,
				last_sign_in_at: (admin.users as any).last_sign_in_at,
				app_metadata: {
					role: admin.role
				}
			})) || [];

			return json(adminUsers);
		} else {
			// List all users - this would need service role key for full admin access
			return json({ error: 'Full user listing requires service role access' }, { status: 403 });
		}
	} catch (error) {
		console.error('Error in users API:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ request, locals: { supabase, user } }) => {
	try {
		// Require super admin authentication
		requireSuperAdmin(user);

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
		if (user?.id === userId && role !== 'super_admin') {
			return json({ error: 'Cannot remove super admin role from yourself' }, { status: 400 });
		}

		// Update role in project_admins table instead of auth metadata
		// This doesn't require service role access
		const { error: updateError } = await supabase
			.from('project_admins')
			.update({ role })
			.eq('user_id', userId);

		if (updateError) {
			console.error('Error updating user role in project_admins:', updateError);
			return json({ error: 'Failed to update user role' }, { status: 500 });
		}

		return json({ success: true, message: 'User role updated successfully' });
	} catch (error) {
		console.error('Error updating user role:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 