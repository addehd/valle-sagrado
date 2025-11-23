<script lang="ts">
	import ColorSamples from './ColorSamples.svelte';

	// Content item types
	type ArtworkItem = {
		type: 'artwork';
		data: {
			id: number;
			artname?: string;
			artist: string;
			shortDescription: string;
			shortDescriptionSv?: string;
			artPieceImg: string;
			primaryColor: string;
			accentColor: string;
		};
	};

	type ComponentItem = {
		type: 'component';
		component: any; // Svelte component constructor
		props?: Record<string, any>;
	};

	type ContentItem = ArtworkItem | ComponentItem;

	// Props - support both old single artwork and new content array
	export let artwork: ArtworkItem['data'] | undefined = undefined;
	export let contentItems: ContentItem[] = [];
	export let innerHeight: number;
	export let displayMode: 'side' | 'fullscreen' | 'centered' = 'side';
	export let shadow: 'sm' | 'md' | 'lg' = 'md';
	export let currentLanguage: 'en' | 'sv' = 'en';

	// Shadow variables
	const shadowSm = 'shadow-lg shadow-black shadow-opacity-20';
	const shadowMd = 'shadow-xl shadow-black shadow-opacity-25';
	const shadowLg = 'shadow-2xl shadow-black shadow-opacity-30';
	
	// Get shadow class based on prop
	$: shadowClass = shadow === 'sm' ? shadowSm : shadow === 'lg' ? shadowLg : shadowMd;

	// Backward compatibility: if artwork prop is provided, convert to contentItems format
	$: items = artwork ? [{ type: 'artwork' as const, data: artwork }] : contentItems;

	// Get description based on current language
	function getDescription(item: ArtworkItem) {
		if (currentLanguage === 'sv' && item.data.shortDescriptionSv) {
			return item.data.shortDescriptionSv;
		}
		return item.data.shortDescription;
	}
</script>

<!-- Render multiple content items -->
{#each items as item, itemIndex}
	<section 
		class="flex items-center justify-center relative" 
		style="min-height: {innerHeight}px;"
		role={item.type === 'artwork' ? 'img' : 'region'}
		aria-label={item.type === 'artwork' ? `Artwork: ${item.data.artname}` : `Custom component ${itemIndex + 1}`}>
		
		{#if item.type === 'component'}
			<!-- Custom component with same container styling as artwork -->
			<div class="max-w-none w-full h-full flex items-center justify-center px-4 md:px-8">
				<div class="w-full text-center">
					<svelte:component 
						this={item.component} 
						{...item.props}
						index={itemIndex}
						{innerHeight}
						{displayMode}
						{shadow} />
				</div>
			</div>
		{:else if displayMode === 'side'}
			<!-- Current layout with info on side -->
			<div class="max-w-none w-full h-full flex items-center justify-center px-4 md:px-8">
				<div class="grid grid-cols-1 xl:grid-cols-3 gap-12 xl:gap-16 items-center w-full text-gray-600 max-xl:text-center" class:xl:grid-flow-col-dense={itemIndex % 2 === 1}>
					<div class="relative aspect-[4/3] {shadowClass} xl:col-span-2 bg-white" class:xl:order-2={itemIndex % 2 === 1}>
						<img 
							src={item.data.artPieceImg} 
							alt={item.data.artname}
							loading="lazy"
							class="w-full h-full object-cover" />
					</div>
					
					<div class="py-8 xl:col-span-1" class:xl:order-1={itemIndex % 2 === 1}>
						<p class="text-lg leading-relaxed opacity-90 mb-8 font-light">
							{getDescription(item)}
						</p>
						
						<ColorSamples image={item.data.artPieceImg} />
					</div>
				</div>
			</div>
		{:else if displayMode === 'fullscreen'}
			<!-- Fullscreen without overlay -->
			<div class="relative w-full h-full bg-white">
				<img 
					src={item.data.artPieceImg} 
					alt={item.data.artname}
					loading="lazy"
					class="w-full h-full object-cover" />
			</div>
		{:else if displayMode === 'centered'}
			<!-- Centered at 70% width -->
			<div class="w-full h-full flex items-center justify-center px-4 md:px-8">
				<div class="w-full md:w-[70%] text-center text-gray-600">
					<div class="relative aspect-[4/3] {shadowClass} mb-8 bg-white">
						<img 
							src={item.data.artPieceImg} 
							alt={item.data.artname}
							loading="lazy"
							class="w-full h-full object-cover" />
					</div>
					
					<div class="text-base opacity-70 font-light tracking-[2px] mb-4">
						{String(itemIndex + 1).padStart(2, '0')}
					</div>
					
					<h2 class="text-5xl md:text-5xl font-light mb-4 leading-tight tracking-wide">{item.data.artname}</h2>
					
					<p class="text-lg leading-relaxed opacity-90 mb-8 font-light max-w-2xl mx-auto">
						{getDescription(item)}
					</p>
					
					<ColorSamples image={item.data.artPieceImg} />
					
					<div class="flex justify-center mb-8">
						<div class="w-10 h-5 rounded-l-md" style="background-color: {item.data.primaryColor}"></div>
						<div class="w-10 h-5 rounded-r-md -ml-0.5" style="background-color: {item.data.accentColor}"></div>
					</div>
					
					<button class="bg-transparent border-2 px-8 py-4 text-base font-normal tracking-wide rounded-md cursor-pointer transition-all duration-300 uppercase hover:bg-white hover:bg-opacity-10 hover:-translate-y-0.5" style="border-color: {item.data.accentColor}; color: {item.data.accentColor};">
						View Artwork
					</button>
				</div>
			</div>
		{/if}
	</section>
{/each}
