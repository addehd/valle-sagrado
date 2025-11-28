import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return fail(400, { error: 'Email is required' });
		}

		// Get the origin for the redirect URL
		const redirectTo = `${url.origin}/auth/update-password`;

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo
		});

		if (error) {
			console.error('Password reset error:', error);
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
