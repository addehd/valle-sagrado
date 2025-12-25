import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	// When user clicks the reset link from email, Supabase sets a session
	// Verify the user is authenticated (via the recovery token)
	const { data: { user }, error } = await supabase.auth.getUser();
	
	if (error || !user) {
		// Invalid or expired token, or no session
		throw redirect(303, '/auth/forgot-password?error=invalid_token');
	}

	return {
		email: user.email
	};
};

export const actions: Actions = {
	resetPassword: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		// Validate passwords
		if (!password || !confirmPassword) {
			return fail(400, {
				error: 'Both password fields are required'
			});
		}

		if (password.length < 6) {
			return fail(400, {
				error: 'Password must be at least 6 characters long'
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Passwords do not match'
			});
		}

		// Update password via Supabase
		const { error } = await supabase.auth.updateUser({
			password: password
		});

		if (error) {
			console.error('[Reset Password] Error:', error.message);
			return fail(500, {
				error: 'Failed to reset password. The link may have expired. Please request a new one.'
			});
		}

		// Success - redirect to login page with success message
		throw redirect(303, '/auth?password_reset=success');
	}
};
