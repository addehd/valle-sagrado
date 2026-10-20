<script lang="ts">
	import MetaTags from '$components/MetaTags.svelte';
	import { getProjectConfig } from '$lib/config/projects';

	let { children } = $props();
	const maria = getProjectConfig('maria');
</script>

<MetaTags
	title={maria?.meta.title ?? 'Maria Ocampo – Atelje'}
	description={maria?.meta.description ?? 'Oil paintings and atmospheric landscapes by Maria Ocampo.'}
	image="https://mariaocampo.se/2025/1.webp"
	url="https://mariaocampo.se/"
	canonical="https://mariaocampo.se/"
	siteName="Maria Ocampo"
	author="Maria Ocampo"
	keywords="Maria Ocampo, painting, oil painting, landscape, atelje, Malmö, art"
	twitterSite=""
	twitterCreator="" />

<div class="min-h-screen bg-white transition-colors duration-200" data-sveltekit-preload-data="hover">
	<!-- <Header /> -->
	
	<!-- <div class="fixed top-4 right-4 z-40">
		<ThemeToggle />
	</div> -->

	<main class="border-white w-full">
		{@render children()}
	</main>
</div>

<style>
	/* Hide the theme toggle from parent layout */
	:global(.fixed.top-4.right-4.z-40) {
		display: none !important;
	}
	
	/* Alternative: target by theme toggle class if it has one */
	:global([data-theme-toggle]) {
		display: none !important;
	}
</style>