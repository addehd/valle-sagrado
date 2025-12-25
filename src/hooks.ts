import { type Reroute } from '@sveltejs/kit'

/**
 * Reroute hook - runs BEFORE route resolution
 * This allows domain-based routing to work for ALL paths and subroutes
 */
export const reroute: Reroute = ({ url }) => {
  const hostname = url.hostname;
  const pathname = url.pathname;
  
  // Never rewrite these routes - they exist at root level
  const rootRoutes = ['/auth', '/create', '/api', '/admin'];
  if (rootRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
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
  
  // Localhost/development - use query params
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    const domain = url.searchParams.get('domain');
    
    if (domain === 'danny' && !pathname.startsWith('/danny')) {
      return buildReroute('/danny');
    }
    
    if (domain === 'maria' && !pathname.startsWith('/maria')) {
      return buildReroute('/maria');
    }
    
    if (domain === 'rikuy' && !pathname.startsWith('/rikuy')) {
      return buildReroute('/rikuy');
    }
    
    // Localhost without domain param: show route list (don't reroute)
    return undefined;
  }
  
  // Production fallback: unknown domains go to rikuy
  if (!pathname.startsWith('/rikuy')) {
    return buildReroute('/rikuy');
  }
  
  return undefined;
}
