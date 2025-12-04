<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { themeStore } from '$lib/stores/theme'
	import Header from '../components/Header.svelte'
	import ThemeToggle from '../components/ThemeToggle.svelte'
	import MetaTags from '../components/MetaTags.svelte'
	import { onMount } from 'svelte';
	
	let { data, children } = $props();
  // let { logo_url, colors, name, website_url, description } = data.brand;
    
	if (browser) {
		themeStore.init();
	}
	
	onMount(async () => {
		if (!browser) return;
		
		console.log('[Auth] Layout mounted - Setting up auth listener');
		const { supabase } = await import('$lib/supabaseClient');
		
		// Listen for auth state changes to keep client in sync with server
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(event, session) => {
				console.log('[Auth] Auth state changed:', { event, user: session?.user?.email });
			}
		);
		
		return () => {
			console.log('[Auth] Cleaning up auth listener');
			subscription?.unsubscribe();
		};
	});
</script>

<MetaTags />

<div class="min-h-screen dark:bg-gray-900 bg-white transition-colors duration-200" data-sveltekit-preload-data="hover">
	<!-- <Header /> -->
	
	<!-- Fixed Theme Toggle in top right corner -->
	<!-- <div class="fixed top-4 right-4 z-40">
		<ThemeToggle />
	</div> -->
	
	<main>
		{@render children()}
	</main>
</div>