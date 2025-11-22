import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, url, locals }) => {
	const host = request.headers.get('host');
	const domain = locals.domain;
	
	return {
		debug: {
			host,
			pathname: url.pathname,
			domain,
			timestamp: new Date().toISOString()
		}
	};
};
