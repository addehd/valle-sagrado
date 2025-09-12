<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import ColorSamples from './components/ColorSamples.svelte';
	import ArtworkSection from './components/ArtworkSection.svelte';
	import ArtistHeader from './components/ArtistHeader.svelte';
	import FullscreenVideo from '../../components/FullscreenVideo.svelte';
	import FullscreenSlideshow from '../../components/FullscreenSlideshow.svelte';
	import ContactSection from '../../components/ContactSection.svelte';
	
    export let data: import('./$types').PageData;

	let scrollY = 0;
	let innerHeight = 0;
	let sections = [];
	let currentSectionIndex = 0;
	
	// Display mode for artworks: 'side', 'fullscreen', or 'centered'
	let displayMode: 'side' | 'fullscreen' | 'centered' = 'side';
	
	// Handle display mode changes from the header component
	const handleDisplayModeChange = (mode: 'fullscreen' | 'side') => {
		displayMode = mode;
	};
	
	let currentBackgroundColor = '#ffffff';
	
	// Image transition state
	let currentImageIndex = 0;
	const heroImages = ['/images/buo.png', '/images/buo2.png']; // Using the same image as requested
	
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
		console.log(`colorToPercent input: ${color}, percent: ${percent}, parsed RGB:`, rgb);
		
		const opacity = percent / 100;
		// Mix the color with white at specified opacity
		const r = Math.round(255 + (rgb.r - 255) * opacity);
		const g = Math.round(255 + (rgb.g - 255) * opacity);
		const b = Math.round(255 + (rgb.b - 255) * opacity);
		
		const result = `rgb(${r}, ${g}, ${b})`;
		console.log(`colorToPercent result: ${result}`);
		
		return result;
	}
	
	// Function to interpolate between two colors
	function interpolateColor(color1: string, color2: string, factor: number): string {
		console.log(`interpolateColor inputs: color1=${color1}, color2=${color2}, factor=${factor}`);
		
		// Parse RGB values from rgb() strings
		const parseRgb = (rgbString: string) => {
			const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
			return match ? {
				r: parseInt(match[1], 10),
				g: parseInt(match[2], 10),
				b: parseInt(match[3], 10)
			} : { r: 255, g: 255, b: 255 };
		};
		
		const rgb1 = parseRgb(color1);
		const rgb2 = parseRgb(color2);
		
		console.log('parsed rgb1:', rgb1, 'parsed rgb2:', rgb2);
		
		const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
		const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
		const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
		
		const result = `rgb(${r}, ${g}, ${b})`;
		console.log(`interpolateColor result: ${result}`);
		
		return result;
	}
	
	// Calculate background color based on scroll position
	$: if (browser && data.artPieces) {
		const sectionHeight = innerHeight;
		const totalScrollHeight = data.artPieces.length * sectionHeight;
		
		// Determine which section we're in
		const exactSectionIndex = (scrollY / sectionHeight);
		const currentIndex = Math.floor(exactSectionIndex);
		const nextIndex = Math.min(currentIndex + 1, data.artPieces.length - 1);
		const sectionProgress = exactSectionIndex - currentIndex;
		
		currentSectionIndex = currentIndex;
		
		// Get colors for current and next sections
		const currentColor = data.artPieces[currentIndex]?.primaryColor || '#ffffff';
		const nextColor = data.artPieces[nextIndex]?.primaryColor || currentColor;
		
		// Convert to 5% opacity colors
		const current5Percent = colorToPercent(currentColor, 5);
		const next5Percent = colorToPercent(nextColor, 5);
		
		// Smoothly interpolate between the 5% opacity colors based on scroll progress
		const newBackgroundColor = interpolateColor(current5Percent, next5Percent, sectionProgress);
		
		currentBackgroundColor = newBackgroundColor;
	}
	
	onMount(() => {
		console.log('=== OnMount Debug ===');
		console.log('data.artPieces:', data.artPieces);
		console.log('data.artPieces.length:', data.artPieces?.length);
		
		// Set initial background color to 5% of first artwork's color
		// if (data.artPieces && data.artPieces.length > 0) {
		// 	console.log('First artwork primaryColor:', data.artPieces[0].primaryColor);
		// 	const initialColor = colorToPercent(data.artPieces[0].primaryColor, 5);
		// 	console.log('Initial background color set to:', initialColor);
		// 	currentBackgroundColor = initialColor;
		// } else {
		// 	console.log('No artPieces found, keeping default background');
		// }
		console.log('===================');
	});
</script>

<svelte:window bind:scrollY bind:innerHeight />

<div class="relative w-full min-h-screen transition-all duration-100 ease-out overflow-hidden" style="background-color: {currentBackgroundColor}">
	<ArtistHeader 
		name="Maria Ocampo" 
		displayMode={displayMode} 
		onDisplayModeChange={handleDisplayModeChange} />
	
	<!-- Fullscreen hero section with fading images -->
	<section class="w-full h-screen flex items-center justify-center relative bg-white">
		<div class="relative w-[30rem] h-80 flex items-center justify-center">
			{#each heroImages as image, index}
				<div 
					class="absolute top-0 left-0 w-full h-full transition-all duration-1000 ease-in-out"
					class:opacity-100={index === currentImageIndex}
					class:opacity-0={index !== currentImageIndex}
					style="background-image: url({image}); background-size: cover; background-position: center; width: 30rem; height: 20rem; transform: scale({index === currentImageIndex ? 1 : 0.95});">
				</div>
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

	<section class="w-full min-h-screen flex items-center justify-center relative">
		<FullscreenVideo 
			src="/maria.mov"
			controls={true}
			muted={false}
			loop={false}>

		</FullscreenVideo>
	</section>



	<!-- Contact Section -->
	<ContactSection 
		artistName="Maria Ocampo"
		welcomeText="Welcome to Atelje"
		address="Rolfsgatan 16"
		location="Sofielunds Folketshus"
		mapCoordinates={{ lat: 55.5855856, lng: 13.0133482 }}
		googleMapsQuery="Rolfsgatan+16,+Malmö,+Sweden" />

		<!-- Fullscreen Slideshow Section -->
	<FullscreenSlideshow 
		images={[
			'/images/show/kirseberg.jpg',
			'/images/show/leonard-1.jpg',
			'/images/show/leonard-2.jpg',
			'/images/show/leonard-3.jpg'
		]}
		autoplay={true}
		interval={5000}
		showControls={true}
		showIndicators={true} />

	
	<!-- Scroll indicator -->
	<!-- <div class="fixed right-8 top-1/2 -translate-y-1/2 z-[100] md:right-8 md:top-1/2 md:translate-x-0 max-md:bottom-8 max-md:right-1/2 max-md:top-auto max-md:translate-x-1/2">
		<div class="flex flex-col gap-4 max-md:flex-row">
			{#each data.artPieces as _, index}
				<div 
					class="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer" 
					class:scale-[1.3]={index === currentSectionIndex}
					style="background-color: {index === currentSectionIndex ? '#ffffff' : '#ffffff66'};">
				</div>
			{/each}
		</div>
	</div> -->
</div>


