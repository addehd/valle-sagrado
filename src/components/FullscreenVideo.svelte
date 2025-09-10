<script lang="ts">
  interface Props {
    src: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    isFullscreen?: boolean;
    onVideoEnd?: () => void;
    onVideoPlay?: () => void;
    onVideoPause?: () => void;
  }
  
  let { 
    src, 
    autoplay = false, 
    loop = false, 
    muted = false, 
    controls = true,
    isFullscreen = false,
    onVideoEnd,
    onVideoPlay,
    onVideoPause
  }: Props = $props();
  
  let videoElement = $state<HTMLVideoElement>();
  
  const handleVideoEnd = () => {
    onVideoEnd?.();
  };
  
  const handleVideoPlay = () => {
    onVideoPlay?.();
  };
  
  const handleVideoPause = () => {
    onVideoPause?.();
  };
</script>

{#if isFullscreen}
  <div class="fixed inset-0 z-50 bg-black flex items-center justify-center p-[10%]">
    <video
      bind:this={videoElement}
      {src}
      {autoplay}
      {loop}
      {muted}
      {controls}
      class="w-full h-full object-contain shadow-2xl"
      onended={handleVideoEnd}
      onplay={handleVideoPlay}
      onpause={handleVideoPause}>
      <track kind="captions" />
      Your browser does not support the video tag.
    </video>
  </div>
{:else}
  <video
    bind:this={videoElement}
    {src}
    {autoplay}
    {loop}
    {muted}
    {controls}
    class="w-full h-auto max-w-full shadow-lg"
    onended={handleVideoEnd}
    onplay={handleVideoPlay}
    onpause={handleVideoPause}>
    <track kind="captions" />
    Your browser does not support the video tag.
  </video>
{/if}
