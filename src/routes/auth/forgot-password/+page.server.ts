import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	// Check if this is a password reset callback (has token in URL)
	const token = url.searchParams.get('token');
	const type = url.searchParams.get('type');
	const error = url.searchParams.get('error');
	
	if (token && type === 'recovery') {
		// User clicked the reset link from email
		// Redirect to reset password page with token
		throw redirect(303, `/auth/reset-password?token=${token}`);
	}

	return {
		error: error === 'invalid_token' ? 'Återställningslänken är ogiltig eller har gått ut. Vänligen begär en ny länk.' : null
	};
};

export const actions: Actions = {
	resetPassword: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return fail(400, {
				error: 'Email is required',
				email
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, {
				error: 'Please enter a valid email address',
				email
			});
		}

		// Get the redirect URL for the password reset email
		const redirectTo = `${url.origin}/auth/reset-password`;

		// Send password reset email via Supabase
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo
		});

		if (error) {
			console.error('[Forgot Password] Error:', error.message);
			return fail(500, {
				error: 'Failed to send reset email. Please try again later.',
				email
			});
		}

		// Success - redirect to confirmation page
		throw redirect(303, '/auth/forgot-password/success?email=' + encodeURIComponent(email));
	}
};
