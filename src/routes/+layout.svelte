<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { themeStore } from '$lib/stores/theme'
	import Header from '../components/Header.svelte'
	import ThemeToggle from '../components/ThemeToggle.svelte'
	import MetaTags from '../components/MetaTags.svelte'
	let { children } = $props();
  // let { logo_url, colors, name, website_url, description } = data.brand;
    
	if (browser) {
		themeStore.init();
	}
</script>

<MetaTags />

<div class="min-h-screen dark:bg-gray-900 bg-white transition-colors duration-200">
	<!-- <Header /> -->
	
	<!-- Fixed Theme Toggle in top right corner -->
	<!-- <div class="fixed top-4 right-4 z-40">
		<ThemeToggle />
	</div> -->
	
	<main>
		{@render children()}
	</main>
</div>