import { createServerClient } from '@supabase/ssr'
import { type Handle, type Reroute, redirect } from '@sveltejs/kit'
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

/**
 * Reroute hook - runs BEFORE route resolution
 * This allows domain-based routing to work for ALL paths and subroutes
 */
export const reroute: Reroute = ({ url }) => {
  const host = url.host;
  const pathname = url.pathname;
  
  console.log('[reroute] host:', host, 'pathname:', pathname);
  
  // Maria's domain - mariaocampo.se
  if (host === 'mariaocampo.se' || host === 'www.mariaocampo.se') {
    // Only rewrite if not root and not already on /maria routes
    if (pathname !== '/' && !pathname.startsWith('/maria')) {
      console.log('[reroute] Rewriting to /maria' + pathname);
      return `/maria${pathname}`;
    }
  }
  
  // Danny's domain - cranmer.se
  if (host === 'cranmer.se' || host === 'www.cranmer.se') {
    // Only rewrite if not root and not already on /danny routes
    if (pathname !== '/' && !pathname.startsWith('/danny')) {
      console.log('[reroute] Rewriting to /danny' + pathname);
      return `/danny${pathname}`;
    }
  }
  
  // Rikuy domain - rikuy.one
  if (host === 'rikuy.one' || host === 'www.rikuy.one') {
    // Only rewrite if not root and not already on /rikuy routes
    if (pathname !== '/' && !pathname.startsWith('/rikuy')) {
      console.log('[reroute] Rewriting to /rikuy' + pathname);
      return `/rikuy${pathname}`;
    }
  }
  
  console.log('[reroute] No rewrite, returning:', pathname);
  // Return original pathname if no rewrite needed
  return pathname;
}

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
    // Call getUser() FIRST to suppress the getSession() warning
    const {
      data: { user },
      error: userError,
    } = await event.locals.supabase.auth.getUser()
    
    if (userError || !user) {
      // JWT validation has failed
      return { session: null, user: null }
    }

    // Now call getSession() after getUser() to suppress warnings
    const {
      data: { session },
      error: sessionError,
    } = await event.locals.supabase.auth.getSession()
    
    if (!session) {
      return { session: null, user: null }
    }

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
  }
  
  const response = await resolve(event)
  
  // Add debug headers (visible in browser DevTools Network tab)
  response.headers.set('x-debug-host', host || 'unknown')
  response.headers.set('x-debug-pathname', event.url.pathname)
  response.headers.set('x-debug-domain', event.locals.domain || 'none')
  
  return response
}

export const handle: Handle = sequence(supabase, domainDetection, authGuard)
