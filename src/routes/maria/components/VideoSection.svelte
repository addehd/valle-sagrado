<script lang="ts">
	import FullscreenVideo from '../../../components/FullscreenVideo.svelte';
	
	// Standard props that ArtworkSection passes to all components (for external reference)
	export let index: number; // eslint-disable-line @typescript-eslint/no-unused-vars
	export let innerHeight: number; // eslint-disable-line @typescript-eslint/no-unused-vars
	export let displayMode: 'side' | 'fullscreen' | 'centered'; // eslint-disable-line @typescript-eslint/no-unused-vars
	export let shadow: 'sm' | 'md' | 'lg'; // eslint-disable-line @typescript-eslint/no-unused-vars
	
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
