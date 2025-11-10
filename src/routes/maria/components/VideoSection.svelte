<script lang="ts">
	import FullscreenVideo from '../../../components/FullscreenVideo.svelte';
	
	// Standard props that ArtworkSection passes to all components (for external reference)
	// These are not used internally but are part of the component API
	export const index: number = 0;
	export const innerHeight: number = 0;
	export const displayMode: 'side' | 'fullscreen' | 'centered' = 'side';
	export const shadow: 'sm' | 'md' | 'lg' = 'md';
	
	// Custom props for video
	export let src: string = '/maria.mov';
	export let controls: boolean = true;
	export let muted: boolean = false;
	export let loop: boolean = false;
</script>

<div class="w-full min-h-screen flex items-center justify-center relative">
	<FullscreenVideo 
		{src}
		{controls}
		{muted}
		{loop}>
	</FullscreenVideo>
</div>
