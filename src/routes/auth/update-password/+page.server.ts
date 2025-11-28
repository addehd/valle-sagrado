import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!password || !confirmPassword) {
			return fail(400, { error: 'Both password fields are required' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters' });
		}

		const { error } = await supabase.auth.updateUser({
			password
		});

		if (error) {
			console.error('Password update error:', error);
			return fail(500, { error: error.message });
		}

		// Password updated successfully, redirect to login
		throw redirect(303, '/auth');
	}
};
