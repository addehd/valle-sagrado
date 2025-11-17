<script lang="ts">
	import CranmerLogo from './components/CranmerLogo.svelte';
	import MetaTags from '$lib/components/MetaTags.svelte';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	console.log('[danny/+page.svelte] Debug data:', data.debug);
</script>

<MetaTags 
	title="Cranmer - Executive Coaching"
	description="Professional executive coaching and leadership development with Danny Cranmer."
	siteName="Cranmer"
/>

<style>
	.hero-bg {
		background-image: url('/images/danny.webp');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
</style>

<div class="fixed inset-0 hero-bg">
	<!-- Debug Info Panel -->
	<div class="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono z-50">
		<div class="font-bold mb-2">Debug Info:</div>
		<div>Host: {data.debug.host}</div>
		<div>Pathname: {data.debug.pathname}</div>
		<div>Domain: {data.debug.domain || 'not set'}</div>
		<div>Time: {data.debug.timestamp}</div>
	</div>
	
	<div class="h-full flex flex-col justify-center items-end pr-16 md:pr-24 lg:pr-32">
		<!-- Logo -->
		<div class="mb-16">
			<CranmerLogo width="200" height="142" />
		</div>

		<!-- Navigation Links -->
		<nav class="flex flex-col gap-8 text-right">
			<a
				href="/danny/om-mig"
				class="text-6xl md:text-7xl lg:text-8xl font-bold text-white hover:text-yellow-300 transition-colors duration-300 font-sans">
				Om mig
			</a>
			<a
				href="/danny/coaching"
				class="text-6xl md:text-7xl lg:text-8xl font-bold text-white hover:text-yellow-300 transition-colors duration-300 font-sans">
				Coaching
			</a>
			<a
				href="/danny/paket"
				class="text-6xl md:text-7xl lg:text-8xl font-bold text-white hover:text-yellow-300 transition-colors duration-300 font-sans">
				Boka
			</a>
		</nav>
	</div>
</div>
