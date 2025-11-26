import type { SupabaseClient, User } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';

export interface AdminUser extends User {
	app_metadata: {
		role?: string;
		[key: string]: any;
	};
}

/**
 * Check if a user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
	if (!user) return false;
	
	// Check if user has admin role in app_metadata
	const role = user.app_metadata?.role;
	return role === 'admin' || role === 'super_admin';
}

/**
 * Check if a user has super admin privileges
 */
export function isSuperAdmin(user: User | null): boolean {
	if (!user) return false;
	
	const role = user.app_metadata?.role;
	return role === 'super_admin';
}

/**
 * Require admin authentication for a route
 * Throws redirect if user is not authenticated or not an admin
 */
export function requireAdmin(user: User | null, redirectTo: string = '/auth'): asserts user is AdminUser {
	if (!user) {
		throw redirect(303, `${redirectTo}?redirect=/admin`);
	}
	
	if (!isAdmin(user)) {
		throw redirect(303, '/auth/unauthorized');
	}
}

/**
 * Require super admin authentication for a route
 */
export function requireSuperAdmin(user: User | null, redirectTo: string = '/auth'): asserts user is AdminUser {
	if (!user) {
		throw redirect(303, `${redirectTo}?redirect=/admin`);
	}
	
	if (!isSuperAdmin(user)) {
		throw redirect(303, '/auth/unauthorized');
	}
}

/**
 * Get admin user info with role
 */
export function getAdminUser(user: User | null): AdminUser | null {
	if (!user || !isAdmin(user)) return null;
	
	return user as AdminUser;
}

/**
 * Set user role (requires service role key)
 */
export async function setUserRole(
	supabase: SupabaseClient,
	userId: string,
	role: 'user' | 'admin' | 'super_admin'
): Promise<{ success: boolean; error?: string }> {
	try {
		const { error } = await supabase.auth.admin.updateUserById(userId, {
			app_metadata: { role }
		});

		if (error) {
			console.error('Error setting user role:', error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error('Error setting user role:', error);
		return { success: false, error: 'Failed to update user role' };
	}
}

/**
 * List all admin users
 */
export async function listAdminUsers(supabase: SupabaseClient): Promise<AdminUser[]> {
	try {
		const { data, error } = await supabase.auth.admin.listUsers();
		
		if (error) {
			console.error('Error listing users:', error);
			return [];
		}

		// Filter for admin users only
		return data.users.filter(user => isAdmin(user)) as AdminUser[];
	} catch (error) {
		console.error('Error listing admin users:', error);
		return [];
	}
}

/**
 * Admin role constants
 */
export const ADMIN_ROLES = {
	USER: 'user',
	ADMIN: 'admin',
	SUPER_ADMIN: 'super_admin'
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES]; 