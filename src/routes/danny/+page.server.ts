import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, url, locals }) => {
	const host = request.headers.get('host');
	const domain = locals.domain;
	
	console.log('[danny/+page.server.ts] Host:', host);
	console.log('[danny/+page.server.ts] URL pathname:', url.pathname);
	console.log('[danny/+page.server.ts] Domain from locals:', domain);
	
	return {
		debug: {
			host,
			pathname: url.pathname,
			domain,
			timestamp: new Date().toISOString()
		}
	};
};
