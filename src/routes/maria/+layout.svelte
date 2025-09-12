<script lang="ts">
	//import { browser } from '$app/environment';
	//import { themeStore } from '$lib/stores/theme'
	//import Header from '../components/Header.svelte'
	//import ThemeToggle from '../components/ThemeToggle.svelte'
	//import MetaTags from '../components/MetaTags.svelte'
	let { children } = $props();
  // let { logo_url, colors, name, website_url, description } = data.brand;
    
	// if (browser) {
	// 	themeStore.init();
	// }
</script>

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