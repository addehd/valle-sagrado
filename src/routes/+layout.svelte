<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte'
	import Header from '$components/Header.svelte'
	
	let { children, data } = $props();
  let { logo_url, colors, name, website_url, description } = data.brand;
    
</script>

<Header />
{@render children()}