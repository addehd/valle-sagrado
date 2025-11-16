<script lang="ts">
	import Menu from './Menu.svelte';

	export let title: string = '';
	export let subtitle: string = '';
	export let badgeText: string = '';
</script>

<section class="relative bg-black text-white py-11 px-6">
	<Menu />
	<div class="max-w-6xl mx-auto text-center">
		{#if title}
			<h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
				{title}
			</h1>
		{/if}
		{#if subtitle}
			<p class="text-xl md:text-2xl text-gray-300 mb-8">
				{subtitle}
			</p>
		{/if}
		{#if badgeText}
			<div class="inline-block bg-yellow-400 text-black px-8 py-3 font-semibold text-lg rounded-full">
				{badgeText}
			</div>
		{/if}
	</div>
</section>