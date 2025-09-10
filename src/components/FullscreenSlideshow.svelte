<script lang="ts">
	import { onMount } from 'svelte';

	export let images: string[] = [];
	export let autoplay: boolean = true;
	export let interval: number = 4000; // 4 seconds
	export let showControls: boolean = true;
	export let showIndicators: boolean = true;

	let currentIndex = 0;
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let isPlaying = autoplay;

	// Auto-advance slides
	onMount(() => {
		if (autoplay && images.length > 1) {
			startAutoplay();
		}
		
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});

	function startAutoplay() {
		if (intervalId) clearInterval(intervalId);
		intervalId = setInterval(() => {
			nextSlide();
		}, interval);
		isPlaying = true;
	}

	function stopAutoplay() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		isPlaying = false;
	}

	function toggleAutoplay() {
		if (isPlaying) {
			stopAutoplay();
		} else {
			startAutoplay();
		}
	}

	function nextSlide() {
		currentIndex = (currentIndex + 1) % images.length;
	}

	function prevSlide() {
		currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
	}

	function goToSlide(index: number) {
		currentIndex = index;
		// Restart autoplay if it was playing
		if (isPlaying) {
			startAutoplay();
		}
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				prevSlide();
				break;
			case 'ArrowRight':
				event.preventDefault();
				nextSlide();
				break;
			case ' ':
				event.preventDefault();
				toggleAutoplay();
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="w-full h-screen relative overflow-hidden bg-black flex items-center justify-center">
	<!-- Slideshow container -->
	<div class="relative w-full h-full">
		{#each images as image, index}
			<div 
				class="absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center"
				class:opacity-100={index === currentIndex}
				class:opacity-0={index !== currentIndex}>
				<img 
					src={image} 
					alt="Slideshow image {index + 1}"
					class="w-full h-full object-cover" />
			</div>
		{/each}

		<!-- Navigation controls -->
		{#if showControls && images.length > 1}
			<button 
				class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-10"
				on:click={prevSlide}
				aria-label="Previous image">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>

			<button 
				class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-10"
				on:click={nextSlide}
				aria-label="Next image">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>

			<!-- Play/Pause button -->
			<button 
				class="absolute bottom-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
				on:click={toggleAutoplay}
				aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
				{#if isPlaying}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" />
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M8 5v14l11-7z" />
					</svg>
				{/if}
			</button>
		{/if}

		<!-- Slide indicators -->
		{#if showIndicators && images.length > 1}
			<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
				{#each images as _, index}
					<button 
						class="w-3 h-3 rounded-full transition-all duration-200 {index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}"
						on:click={() => goToSlide(index)}
						aria-label="Go to slide {index + 1}">
					</button>
				{/each}
			</div>
		{/if}

		<!-- Image counter -->
		<div class="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
			{currentIndex + 1} / {images.length}
		</div>
	</div>
</section>
