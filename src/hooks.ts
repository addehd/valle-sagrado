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
    // Only rewrite if not root and not already on /maria routes
    if (pathname !== '/' && !pathname.startsWith('/maria')) {
      const newPath = `/maria${pathname}`;
      console.log('[reroute] Maria - Rewriting to', newPath);
      return newPath;
    }
  }
  
  // Danny's domain - cranmer.se
  if (hostname === 'cranmer.se' || hostname === 'www.cranmer.se') {
    // Only rewrite if not root and not already on /danny routes
    if (pathname !== '/' && !pathname.startsWith('/danny')) {
      const newPath = `/danny${pathname}`;
      console.log('[reroute] Danny - Rewriting to', newPath);
      return newPath;
    }
  }
  
  // Rikuy domain - rikuy.one
  if (hostname === 'rikuy.one' || hostname === 'www.rikuy.one') {
    // Only rewrite if not root and not already on /rikuy routes
    if (pathname !== '/' && !pathname.startsWith('/rikuy')) {
      const newPath = `/rikuy${pathname}`;
      console.log('[reroute] Rikuy - Rewriting to', newPath);
      return newPath;
    }
  }
  
  // Development routing - valle-sagrado.test defaults to Danny's routes
  if (hostname === 'valle-sagrado.test' || hostname === 'www.valle-sagrado.test') {
    return
    const domain = url.searchParams.get('domain');
    
    // Allow overriding with query params
    if (domain === 'maria' && pathname !== '/' && !pathname.startsWith('/maria')) {
      const newPath = `/maria${pathname}`;
      console.log('[reroute] Development (Maria override) - Rewriting to', newPath);
      return newPath;
    }
    
    if (domain === 'rikuy' && pathname !== '/' && !pathname.startsWith('/rikuy')) {
      const newPath = `/rikuy${pathname}`;
      console.log('[reroute] Development (Rikuy override) - Rewriting to', newPath);
      return newPath;
    }
    
    // Default to Danny's routes
    if (pathname !== '/' && !pathname.startsWith('/danny')) {
      const newPath = `/danny${pathname}`;
      console.log('[reroute] Development (Danny default) - Rewriting to', newPath);
      return newPath;
    }
  }
  
  // Other localhost/development domains still need query params
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    const domain = url.searchParams.get('domain');
    
    if (domain === 'danny' && pathname !== '/' && !pathname.startsWith('/danny')) {
      const newPath = `/danny${pathname}`;
      console.log('[reroute] Localhost (Danny) - Rewriting to', newPath);
      return newPath;
    }
    
    if (domain === 'maria' && pathname !== '/' && !pathname.startsWith('/maria')) {
      const newPath = `/maria${pathname}`;
      console.log('[reroute] Localhost (Maria) - Rewriting to', newPath);
      return newPath;
    }
    
    if (domain === 'rikuy' && pathname !== '/' && !pathname.startsWith('/rikuy')) {
      const newPath = `/rikuy${pathname}`;
      console.log('[reroute] Localhost (Rikuy) - Rewriting to', newPath);
      return newPath;
    }
  }
  
  console.log('[reroute] ❌ No hostname match - returning undefined (default routing)');
  console.log('================================');
  // Return undefined to use default routing
  return undefined;
}
