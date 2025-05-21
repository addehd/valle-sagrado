<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte'
	import Header from '$components/Header.svelte'
	
	let { children, data } = $props();
  let { logo_url, colors, name, website_url, description } = data.brand;
    
</script>

<div class="bg-[#F6F6F6]">{@render children()}</div>