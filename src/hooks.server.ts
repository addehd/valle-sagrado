import { createServerClient } from '@supabase/ssr'
import { type Handle, redirect } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      /**
       * SvelteKit's cookies API requires `path` to be explicitly set in
       * the cookie options. Setting `path` to `/` replicates previous/
       * standard behavior.
       */
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' })
        })
      },
    },
  })

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
      error,
    } = await event.locals.supabase.auth.getSession()
    
    if (error || !session) {
      return { session: null, user: null }
    }

    const {
      data: { user },
      error: userError,
    } = await event.locals.supabase.auth.getUser()
    
    if (userError || !user) {
      return { session: null, user: null }
    }

    return { 
      session, 
      user 
    }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
}

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession()
  event.locals.session = session
  event.locals.user = user

  const isLoggedIn = event.locals.session && event.locals.user

  // Log admin route access for debugging curl commands
  if (event.url.pathname.startsWith('/admin') || event.url.pathname.startsWith('/api/admin')) {
    console.log('\n=== ADMIN ROUTE ACCESS DEBUG ===');
    console.log('URL:', event.url.pathname);
    console.log('Method:', event.request.method);
    
    // Log all cookies
    const cookies = event.cookies.getAll();
    console.log('Cookies:', cookies.map(c => `${c.name}=${c.value}`).join('; '));
    
    // Log curl-compatible cookie header
    if (cookies.length > 0) {
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      console.log('\nCurl Cookie Header:');
      console.log(`-H "Cookie: ${cookieHeader}"`);
    }
    
    // Log authorization headers
    const authHeader = event.request.headers.get('authorization');
    if (authHeader) {
      console.log('Authorization Header:', authHeader);
      console.log(`Curl Auth Header: -H "Authorization: ${authHeader}"`);
    }
    
    // Log session info
    if (user) {
      console.log('User authenticated:', user.email);
      console.log('User role:', user.app_metadata?.role || 'no role');
      console.log('User ID:', user.id);
    } else {
      console.log('User: NOT AUTHENTICATED');
    }
    
    // Generate complete curl command
    const cookieHeader = cookies.length > 0 ? cookies.map(c => `${c.name}=${c.value}`).join('; ') : '';
    console.log('\n--- Complete Curl Command ---');
    console.log(`curl -X ${event.request.method} "http://localhost:5173${event.url.pathname}" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    if (cookieHeader) {
      console.log(`  -H "Cookie: ${cookieHeader}" \\`);
    }
    if (authHeader) {
      console.log(`  -H "Authorization: ${authHeader}" \\`);
    }
    console.log(`  -v`); // verbose mode
    console.log('=== END ADMIN DEBUG ===\n');
  }

  // /arkiv
  if (!isLoggedIn && event.url.pathname.startsWith('/arkiv')) {
    redirect(303, '/')
  }

  // // /
  // if (isLoggedIn && event.url.pathname === '/') {
  //   redirect(303, '/arkiv')
  // }

  // // /hangaren/32
  // if (!isLoggedIn && event.url.pathname === '/') {
  //   redirect(303, '/hangaren/32')
  // }

  return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard)
