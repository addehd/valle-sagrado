import { createServerClient } from '@supabase/ssr'
import { type Handle, redirect } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Suppress Supabase auth warnings in development
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('Using supabase.auth.getSession()') || 
         message.includes('Using the user object as returned from supabase.auth.getSession()'))) {
      return; // Suppress these specific warnings
    }
    originalWarn.apply(console, args);
  };
}

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  const cookies = event.cookies.getAll();
  console.log('[supabase] Available cookies:', cookies.map(c => c.name).join(', '));
  
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      /**
       * SvelteKit's cookies API requires `path` to be explicitly set in
       * the cookie options. Setting `path` to `/` replicates previous/
       * standard behavior.
       */
      setAll: (cookiesToSet) => {
        console.log('[Supabase setAll] Setting cookies:', cookiesToSet.map(c => c.name).join(', '))
        
        cookiesToSet.forEach(({ name, value, options }) => {
          // Don't set domain explicitly - let browser handle it
          // This fixes issues with .test TLD in local development
          const cookieOptions = { 
            ...options, 
            path: '/',
            secure: false, // Allow non-HTTPS for .test domain
            sameSite: 'lax' as const,
            httpOnly: true,
          }
          // Remove domain if set - let SvelteKit handle it
          delete (cookieOptions as any).domain
          console.log('[Supabase setAll] Cookie:', name)
          event.cookies.set(name, value, cookieOptions)
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
    // Call getUser() FIRST to suppress the getSession() warning
    const {
      data: { user },
      error: userError,
    } = await event.locals.supabase.auth.getUser()
    
    if (userError) {
      console.log('[safeGetSession] getUser error:', userError.message)
    }
    if (!user) {
      console.log('[safeGetSession] No user found from getUser()')
      // JWT validation has failed
      return { session: null, user: null }
    }

    console.log('[safeGetSession] User found:', user.email)

    // Now call getSession() after getUser() to suppress warnings
    const {
      data: { session },
      error: sessionError,
    } = await event.locals.supabase.auth.getSession()
    
    if (sessionError) {
      console.log('[safeGetSession] getSession error:', sessionError.message)
    }
    if (!session) {
      console.log('[safeGetSession] No session found')
      return { session: null, user: null }
    }

    console.log('[safeGetSession] Session found for:', session.user?.email)
    // Return the original session but with validated user
    return { 
      session: { ...session, user }, 
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
    transformPageChunk: ({ html }) => {
      // Add CSP header to allow localhost connections for development
      if (event.url.pathname.startsWith('/figma')) {
        return html.replace(
          '<head>',
          '<head><meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob: http://localhost:* https://via.placeholder.com; style-src \'self\' \'unsafe-inline\'; connect-src \'self\' http://localhost:* https://*">'
        );
      }
      return html;
    }
  })
}


const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession()
  // Don't pass session to locals to avoid serialization warnings
  // event.locals.session = session  
  event.locals.user = user

  const isLoggedIn = session && user
  console.log('[authGuard] path=', event.url.pathname, 'isLoggedIn=', Boolean(isLoggedIn), 'user=', user?.email)
  console.log('[authGuard] session=', session ? 'exists' : 'null')
  console.log('[authGuard] cookies=', event.cookies.getAll().map(c => c.name).join(', '))

  // Redirect logged-in users away from auth page
  if (isLoggedIn && event.url.pathname === '/auth') {
    console.log('[authGuard] redirect /auth -> / for logged-in user')
    redirect(303, '/')
  }

  // Log admin route access for debugging curl commands
  if (event.url.pathname.startsWith('/admin') || event.url.pathname.startsWith('/api/admin')) {
    const cookies = event.cookies.getAll();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    const authHeader = event.request.headers.get('authorization');

    // Get user for debugging - do this first to suppress session warnings
    const { data: { user } } = await event.locals.supabase.auth.getUser();

    if (user) {
      // User is authenticated, allow access
    } else {
      // User not authenticated
    }
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

/**
 * Domain detection hook - sets event.locals.domain based on host
 * The actual route rewriting is done by the reroute hook above
 */
const domainDetection: Handle = async ({ event, resolve }) => {
  const host = event.request.headers.get('host')
  console.log('--------------------------------');
  console.log('[domainDetection] host:', host);
  console.log('[domainDetection] pathname:', event.url.pathname);
  
  // Set domain identifier for use in routes
  if (host === 'mariaocampo.se' || host === 'www.mariaocampo.se') {
    event.locals.domain = 'maria'
  } else if (host === 'cranmer.se' || host === 'www.cranmer.se') {
    event.locals.domain = 'danny'
  } else if (host === 'rikuy.one' || host === 'www.rikuy.one') {
    event.locals.domain = 'rikuy'
  } else if (host === 'valle-sagrado.test' || host === 'www.valle-sagrado.test') {
    // Development domain defaults to Danny
    event.locals.domain = 'danny'
  }
  
  const response = await resolve(event)
  
  // Add debug headers (visible in browser DevTools Network tab)
  response.headers.set('x-debug-host', host || 'unknown')
  response.headers.set('x-debug-pathname', event.url.pathname)
  response.headers.set('x-debug-domain', event.locals.domain || 'none')
  
  return response
}

export const handle: Handle = sequence(supabase, domainDetection, authGuard)
