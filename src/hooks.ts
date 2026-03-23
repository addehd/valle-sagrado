import { type Reroute } from '@sveltejs/kit'
import {
	devDomainKeys,
	DEV_DOMAIN_COOKIE,
	defaultDomain,
	domains,
	matchDomain,
	prefixForKey,
	shouldBypass
} from '$lib/config/domains'

/**
 * Reroute hook - runs BEFORE route resolution
 * This allows domain-based routing to work for ALL paths and subroutes
 */
export const reroute: Reroute = ({ url }) => {
	const hostname = url.hostname;
	const pathname = url.pathname;

	const isLocalhost = hostname === 'localhost' || hostname.startsWith('127.0.0.1');
	const isRootPath = pathname === '/' || pathname === '';

	const buildReroute = (prefix: string): string => {
		const search = url.search;
		const hash = url.hash;
		return `${prefix}${pathname}${search}${hash}`;
	};

	if (isLocalhost && isRootPath) {
		return undefined;
	}

	if (shouldBypass(pathname)) {
		return undefined;
	}

	const matchedDomain = matchDomain(hostname);
	if (matchedDomain && !pathname.startsWith(matchedDomain.prefix)) {
		return buildReroute(matchedDomain.prefix);
	}

	if (isLocalhost) {
		const domainParam = url.searchParams.get('domain');

		let domainCookie: string | null = null;
		if (typeof document !== 'undefined') {
			const cookies = document.cookie.split(';');
			const devDomainCookie = cookies
				.map(c => c.trim())
				.find(c => c.startsWith(`${DEV_DOMAIN_COOKIE}=`));
			if (devDomainCookie) {
				domainCookie = devDomainCookie.split('=')[1]?.trim() || null;
			}
		}

		const domain = domainParam || domainCookie;

		if (domain && devDomainKeys.includes(domain as (typeof devDomainKeys)[number])) {
			const prefix = prefixForKey(domain as typeof domains[number]['key']);
			if (!pathname.startsWith(prefix)) {
				return buildReroute(prefix);
			}
		}

		return undefined;
	}

	const defaultPrefix = prefixForKey(defaultDomain);
	if (!pathname.startsWith(defaultPrefix)) {
		return buildReroute(defaultPrefix);
	}

	return undefined;
}
