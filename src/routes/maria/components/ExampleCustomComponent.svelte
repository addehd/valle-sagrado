<script lang="ts">
	// Standard props that ArtworkSection passes to all components
	export let index: number;
	export let innerHeight: number;
	export let displayMode: 'side' | 'fullscreen' | 'centered';
	export let shadow: 'sm' | 'md' | 'lg';
	
	// Custom props specific to this component
	export let title: string = 'Custom Component';
	export let description: string = 'This is a custom component inserted between artworks';
	export let buttonText: string = 'Learn More';
</script>

<div class="flex flex-col items-center justify-center text-center py-16 px-8">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-4xl md:text-5xl font-light mb-6 text-gray-800 tracking-wide">
			{title}
		</h2>
		
		<p class="text-lg text-gray-600 leading-relaxed mb-8 font-light max-w-2xl mx-auto">
			{description}
		</p>
		
		<div class="text-sm text-gray-400 mb-6 space-y-1">
			<p>Index: {index} | Display Mode: {displayMode} | Shadow: {shadow}</p>
			<p>Inner Height: {innerHeight}px</p>
		</div>
		
		<button class="bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-700 transition-colors duration-300 font-light tracking-wide uppercase text-sm">
			{buttonText}
		</button>
	</div>
</div>
