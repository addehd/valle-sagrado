import { redirect, type RequestEvent } from '@sveltejs/kit'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	const passwordReset = url.searchParams.get('password_reset');
	return {
		passwordResetSuccess: passwordReset === 'success'
	};
};

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error(error)
      redirect(303, '/auth/error')
    } else {
      redirect(303, '/')
    }
  },
  login: async ({ request, locals: { supabase }, cookies }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('[Auth Server] Login attempt for:', email)
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      console.error('[Auth Server] Login error:', error.message)
      throw redirect(303, '/auth/error')
    }
    
    console.log('[Auth Server] Login successful for:', email)
    console.log('[Auth Server] Cookies after login:', cookies.getAll().map(c => c.name).join(', '))
    
    // The signInWithPassword already sets cookies via the hooks.server.ts setAll
    // Just redirect - cookies will be included in the response
    throw redirect(303, '/create')
  },
}