import { redirect } from '@sveltejs/kit'

import type { Actions } from './$types'

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
      redirect(303, '/auth/error')
    } else {
      console.log('[Auth Server] Login successful for:', email)
      console.log('[Auth Server] Session user:', data.session?.user?.email)
      
      // Manually set auth cookies after successful login
      // This ensures the Supabase SSR client can read the session on next request
      if (data.session) {
        const expiresIn = 60 * 60 * 24 * 365 // 1 year in seconds
        const expires = new Date(Date.now() + expiresIn * 1000)
        
        const isProduction = process.env.NODE_ENV === 'production'
        
        cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          maxAge: expiresIn,
          httpOnly: true,
          secure: isProduction, // Allow non-HTTPS in development
          sameSite: 'lax'
        })
        
        cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          maxAge: expiresIn,
          httpOnly: true,
          secure: isProduction, // Allow non-HTTPS in development
          sameSite: 'lax'
        })
        
        console.log('[Auth Server] Auth cookies set successfully', { expiresIn, isProduction })
        
        // Verify cookies were set
        const allCookies = cookies.getAll();
        console.log('[Auth Server] Cookies after setting:', allCookies.map(c => c.name).join(', '))
      }
      
      redirect(303, '/create')
    }
  },
}