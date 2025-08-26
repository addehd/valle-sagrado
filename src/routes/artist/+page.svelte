<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import ColorSamples from './components/ColorSamples.svelte';
	import ArtworkSection from './components/ArtworkSection.svelte';
	
    export let data: import('./$types').PageData;

	let scrollY = 0;
	let innerHeight = 0;
	let sections = [];
	let currentSectionIndex = 0;
	
	// Display mode for artworks: 'side', 'fullscreen', or 'centered'
	let displayMode: 'side' | 'fullscreen' | 'centered' = 'side';
	
	let currentBackgroundColor = '#ffffff';
	
	// Image transition state
	let currentImageIndex = 0;
	const heroImages = ['/buo.png', '/buo.png']; // Using the same image as requested
	
	// Auto-transition images every 3 seconds
	onMount(() => {
		const interval = setInterval(() => {
			currentImageIndex = (currentImageIndex + 1) % heroImages.length;
		}, 3000);
		
		return () => clearInterval(interval);
	});
	
	// Function to convert color to specified opacity percentage on white background
	function colorToPercent(color: string, percent: number = 5): string {
		const hex2rgb = (hex: string) => {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : { r: 255, g: 255, b: 255 };
		};
		
		const rgb = hex2rgb(color);
		const opacity = percent / 100;
		// Mix the color with white at specified opacity
		const r = Math.round(255 + (rgb.r - 255) * opacity);
		const g = Math.round(255 + (rgb.g - 255) * opacity);
		const b = Math.round(255 + (rgb.b - 255) * opacity);
		
		return `rgb(${r}, ${g}, ${b})`;
	}
	
	// Calculate background color based on scroll position
	$: if (browser && data.artPieces) {
		const sectionHeight = innerHeight;
		const totalScrollHeight = data.artPieces.length * sectionHeight;
		const scrollProgress = scrollY / Math.max(totalScrollHeight - innerHeight, 1);
		
		// Determine which section we're in
		const exactSectionIndex = (scrollY / sectionHeight);
		const currentIndex = Math.floor(exactSectionIndex);
		const nextIndex = Math.min(currentIndex + 1, data.artPieces.length - 1);
		const sectionProgress = exactSectionIndex - currentIndex;
		
		currentSectionIndex = currentIndex;
		
		// Get colors for current and next sections
		const currentColor = data.artPieces[currentIndex]?.primaryColor || '#ffffff';
		const nextColor = data.artPieces[nextIndex]?.primaryColor || currentColor;
		
		// Convert to 5% colors and interpolate
		const current5Percent = colorToPercent(currentColor, 5);
		const next5Percent = colorToPercent(nextColor, 5);
		
		// For simplicity, we'll use current section's 5% color (you could interpolate between 5% colors if needed)
		currentBackgroundColor = sectionProgress < 0.5 ? current5Percent : next5Percent;
	}
	
	onMount(() => {
		// Set initial background color to 5% of first artwork's color
		if (data.artPieces.length > 0) {
			currentBackgroundColor = colorToPercent(data.artPieces[0].primaryColor, 5);
		}
	});
</script>

<svelte:window bind:scrollY bind:innerHeight />

<div class="relative w-full min-h-screen transition-all duration-100 ease-out overflow-hidden" style="background-color: {currentBackgroundColor}">
	<header class="fixed top-8 left-8 z-[100] text-gray-600 max-md:static max-md:text-center max-md:p-8 max-md:bg-black max-md:bg-opacity-50">
		<h1 class="text-4xl font-light mb-2 tracking-[2px] drop-shadow-md max-md:text-3xl">Maria Ocampo</h1>
		<p class="text-lg opacity-90 m-0 font-light mb-4">Discover unique artworks from talented artists around the world</p>
		
		<!-- Display mode controls -->
		<div class="flex gap-2 mt-4">
			<button 
				class="px-3 py-1 text-sm rounded transition-all duration-200"
				class:bg-gray-600={displayMode === 'side'}
				class:text-white={displayMode === 'side'}
				class:bg-white={displayMode !== 'side'}
				class:bg-opacity-20={displayMode !== 'side'}
				onclick={() => displayMode = 'side'}>
				Side
			</button>
			<button 
				class="px-3 py-1 text-sm rounded transition-all duration-200"
				class:bg-gray-600={displayMode === 'fullscreen'}
				class:text-white={displayMode === 'fullscreen'}
				class:bg-white={displayMode !== 'fullscreen'}
				class:bg-opacity-20={displayMode !== 'fullscreen'}
				onclick={() => displayMode = 'fullscreen'}>
				Fullscreen
			</button>
			<button 
				class="px-3 py-1 text-sm rounded transition-all duration-200"
				class:bg-gray-600={displayMode === 'centered'}
				class:text-white={displayMode === 'centered'}
				class:bg-white={displayMode !== 'centered'}
				class:bg-opacity-20={displayMode !== 'centered'}
				onclick={() => displayMode = 'centered'}>
				Centered
			</button>
		</div>
	</header>
	
	<!-- Fullscreen hero section with fading images -->
	<section class="w-full h-screen flex items-center justify-center relative">
		<div class="relative w-80 h-80 flex items-center justify-center">
			{#each heroImages as image, index}
				<img 
					src={image} 
					alt="Hero image {index + 1}"
					class="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000"
					class:opacity-100={index === currentImageIndex}
					class:opacity-0={index !== currentImageIndex}
					style="width: 20rem;" />
			{/each}
		</div>
	</section>
	
	{#each data.artPieces as artwork, index (artwork.id)}
		<div class="p-4" bind:this={sections[index]}>
			<ArtworkSection 
				{artwork} 
				{index} 
				{innerHeight} 
				{displayMode}
				shadow="lg" />
		</div>
	{/each}

	<ColorSamples image={data.artPieces[0].artPieceImg} />
	
	<!-- Scroll indicator -->
	<div class="fixed right-8 top-1/2 -translate-y-1/2 z-[100] md:right-8 md:top-1/2 md:translate-x-0 max-md:bottom-8 max-md:right-1/2 max-md:top-auto max-md:translate-x-1/2">
		<div class="flex flex-col gap-4 max-md:flex-row">
			{#each data.artPieces as _, index}
				<div 
					class="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer" 
					class:scale-[1.3]={index === currentSectionIndex}
					style="background-color: {index === currentSectionIndex ? '#ffffff' : '#ffffff66'};">
				</div>
			{/each}
		</div>
	</div>
</div>


