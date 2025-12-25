import { type Reroute } from '@sveltejs/kit'

/**
 * Reroute hook - runs BEFORE route resolution
 * This allows domain-based routing to work for ALL paths and subroutes
 */
export const reroute: Reroute = ({ url }) => {
  const hostname = url.hostname;
  const pathname = url.pathname;
  
  // On localhost, always allow root path to show route selection page
  // Check both exact match and normalized path (handles trailing slashes)
  const isLocalhost = hostname === 'localhost' || hostname.startsWith('127.0.0.1');
  const normalizedRootPath = pathname === '/' || pathname === '';
  if (isLocalhost && normalizedRootPath) {
    // Always return undefined for root path on localhost - never rewrite
    return undefined;
  }
  
  // Never rewrite these routes - they exist at root level
  // This check MUST happen first, before any domain-based routing logic
  const rootRoutes = ['/auth', '/create', '/api', '/admin'];
  // Normalize pathname (remove trailing slash for exact match check)
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  const isRootRoute = rootRoutes.some(route => 
    normalizedPath === route || normalizedPath.startsWith(route + '/')
  );
  
  if (isRootRoute) {
    return undefined;
  }
  
  // preserve query params and hash
  const buildReroute = (prefix: string): string => {
    const newPath = `${prefix}${pathname}`;
    const search = url.search;
    const hash = url.hash;
    return newPath + search + hash;
  };
  
  // Maria's domain - mariaocampo.se
  if (hostname === 'mariaocampo.se' || hostname === 'www.mariaocampo.se') {
    if (!pathname.startsWith('/maria')) {
      return buildReroute('/maria');
    }
  }
  
  // Danny's domain - cranmer.se
  if (hostname === 'cranmer.se' || hostname === 'www.cranmer.se') {
    if (!pathname.startsWith('/danny')) {
      return buildReroute('/danny');
    }
  }
  
  // Rikuy domain - rikuy.one
  if (hostname === 'rikuy.one' || hostname === 'www.rikuy.one') {
    if (!pathname.startsWith('/rikuy')) {
      return buildReroute('/rikuy');
    }
  }
  
  // Localhost/development - use query params OR cookie preference
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    // CRITICAL: Never rewrite root path - always show route selection page
    // This check must happen BEFORE reading cookies to prevent any rewriting
    // Check both exact match and normalized path (handles trailing slashes)
    if (normalizedRootPath) {
      return undefined;
    }
    
    // Double-check: Never rewrite root routes on localhost (extra safety)
    // This ensures root routes are never rewritten even if domain cookie is set
    if (isRootRoute) {
      return undefined;
    }
    
    // Check query param first
    const domainParam = url.searchParams.get('domain');
    
    // Try to read cookie preference (only works in browser context)
    let domainCookie: string | null = null;
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const devDomainCookie = cookies.find(c => c.trim().startsWith('dev-domain-preference='));
      if (devDomainCookie) {
        domainCookie = devDomainCookie.split('=')[1]?.trim() || null;
      }
    }
    
    // Use query param if available, otherwise fall back to cookie
    const domain = domainParam || domainCookie;
    
    // Only rewrite if pathname doesn't already start with the domain prefix
    // AND it's not a root route (double-checked above)
    // AND it's not the root path (checked above)
    if (domain === 'danny' && !pathname.startsWith('/danny')) {
      return buildReroute('/danny');
    }
    
    if (domain === 'maria' && !pathname.startsWith('/maria')) {
      return buildReroute('/maria');
    }
    
    if (domain === 'rikuy' && !pathname.startsWith('/rikuy')) {
      return buildReroute('/rikuy');
    }
    
    // Localhost without domain param/cookie: show route list (don't reroute)
    return undefined;
  }
  
  // Production fallback: unknown domains go to rikuy
  // But only if it's not already a root route (checked above)
  if (!pathname.startsWith('/rikuy')) {
    return buildReroute('/rikuy');
  }
  
  return undefined;
}
