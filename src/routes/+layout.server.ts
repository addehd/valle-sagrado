// src/routes/+layout.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession }, url, cookies }) => {
  const { session, user } = await safeGetSession();

  // Handle cookie-based domain routing for localhost development
  const hostname = url.hostname;
  const pathname = url.pathname;
  const isLocalhost = hostname === 'localhost' || hostname.startsWith('127.0.0.1');

  if (isLocalhost) {
    const devDomainPreference = cookies.get('dev-domain-preference');
    
    // Root routes that should never be rewritten
    const rootRoutes = ['/auth', '/create'];
    const isRootRoute = rootRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    if (devDomainPreference && !isRootRoute) {
      const domainPrefix = `/${devDomainPreference}`;
      
      // Strip any existing domain prefix to get the base path
      let basePath = pathname;
      const domainPrefixes = ['/danny', '/maria', '/rikuy'];
      for (const prefix of domainPrefixes) {
        if (pathname.startsWith(prefix)) {
          basePath = pathname.slice(prefix.length) || '/';
          break;
        }
      }
      
      // If pathname doesn't start with the cookie's domain prefix, redirect to the prefixed path
      if (!pathname.startsWith(domainPrefix)) {
        // Preserve query params if any
        const searchParams = url.searchParams.toString();
        const redirectPath = `${domainPrefix}${basePath === '/' ? '' : basePath}${searchParams ? `?${searchParams}` : ''}`;
        throw redirect(302, redirectPath);
      }
    }
  }

  const { data: brand, error: err } = await supabase
    .from('brand')
    .select('logo_url, colors, name, website_url, description');

  if (err) {
    console.error('Error fetching brands:', err);
    throw error(500, 'Could not load brand data');
  }

  const brandData = brand || [];

  return {
    session,
    brand: brandData[0],
    user
  };
};