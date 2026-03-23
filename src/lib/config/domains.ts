export type DomainKey = 'maria' | 'tryckbart' | 'danny' | 'rikuy';

type DomainConfig = {
	hostnames: string[];
	key: DomainKey;
	prefix: `/${DomainKey}`;
};

const normalizeHost = (host: string) => host.replace(/^www\./, '');

export const DEV_DOMAIN_COOKIE = 'dev-domain-preference';

export const rootRoutes = ['/auth', '/create', '/api'];

export const domains: DomainConfig[] = [
	{
		key: 'maria',
		prefix: '/maria',
		hostnames: ['mariaocampo.se', 'www.mariaocampo.se']
	},
	{
		key: 'tryckbart',
		prefix: '/tryckbart',
		hostnames: ['tryckbart.se', 'www.tryckbart.se']
	},
	{
		key: 'danny',
		prefix: '/danny',
		hostnames: ['cranmer.se', 'www.cranmer.se', 'valle-sagrado.test']
	},
	{
		key: 'rikuy',
		prefix: '/rikuy',
		hostnames: ['rikuy.one', 'www.rikuy.one']
	}
];

export const defaultDomain: DomainKey = 'rikuy';

export const devDomainKeys: DomainKey[] = ['maria', 'tryckbart', 'danny', 'rikuy'];

export const domainByKey: Record<DomainKey, DomainConfig> = domains.reduce(
	(acc, entry) => ({ ...acc, [entry.key]: entry }),
	{} as Record<DomainKey, DomainConfig>
);

export function matchDomain(hostname: string): DomainConfig | undefined {
	const normalized = normalizeHost(hostname);
	return domains.find(entry => entry.hostnames.map(normalizeHost).includes(normalized));
}

export function prefixForKey(key: DomainKey): string {
	return domainByKey[key]?.prefix ?? '/';
}

export function normalizePath(pathname: string): string {
	if (pathname === '/') return '/';
	return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function shouldBypass(pathname: string): boolean {
	const normalized = normalizePath(pathname);
	return rootRoutes.some(route => normalized === route || normalized.startsWith(`${route}/`));
}
