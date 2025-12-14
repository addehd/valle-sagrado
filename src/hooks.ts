import { type Reroute } from '@sveltejs/kit'

/**
 * Reroute hook - runs BEFORE route resolution
 * This allows domain-based routing to work for ALL paths and subroutes
 */
export const reroute: Reroute = ({ url }) => {
  const hostname = url.hostname;
  const pathname = url.pathname;
  
  // Never rewrite these routes - they exist at root level
  const rootRoutes = ['/auth', '/create'];
  if (rootRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return undefined;
  }
  
  // Maria's domain - mariaocampo.se
  if (hostname === 'mariaocampo.se' || hostname === 'www.mariaocampo.se') {
    if (!pathname.startsWith('/maria')) {
      return `/maria${pathname}`;
    }
  }
  
  // Danny's domain - cranmer.se
  if (hostname === 'cranmer.se' || hostname === 'www.cranmer.se') {
    if (!pathname.startsWith('/danny')) {
      return `/danny${pathname}`;
    }
  }
  
  // Rikuy domain - rikuy.one
  if (hostname === 'rikuy.one' || hostname === 'www.rikuy.one') {
    if (!pathname.startsWith('/rikuy')) {
      return `/rikuy${pathname}`;
    }
  }
  
  // Localhost/development - use query params
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    const domain = url.searchParams.get('domain');
    
    if (domain === 'danny' && !pathname.startsWith('/danny')) {
      return `/danny${pathname}`;
    }
    
    if (domain === 'maria' && !pathname.startsWith('/maria')) {
      return `/maria${pathname}`;
    }
    
    if (domain === 'rikuy' && !pathname.startsWith('/rikuy')) {
      return `/rikuy${pathname}`;
    }
  }
  
  // Localhost without domain param: show route list (don't reroute)
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return undefined;
  }
  
  // Production fallback: unknown domains go to rikuy
  if (!pathname.startsWith('/rikuy')) {
    return `/rikuy${pathname}`;
  }
  
  return undefined;
}
