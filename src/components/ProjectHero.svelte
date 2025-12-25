<script lang="ts">
  import { page } from '$app/stores';

  interface Props {
    project: {
      name: string;
      hero_img?: string;
      profile_image_url?: string;
      location?: string;
    };
  }

  const { project }: Props = $props();
  
  const projectSlug = $derived($page.params.project);
</script>

<!-- Hero Section -->
<div class="relative mb-8">
  <div class="left-0 right-0 bg-gradient-to-t from-black/70">
    <img 
      src={project?.hero_img || project?.profile_image_url || "/images/valle.jpg"}
      alt={project?.name} 
      width="1200"
      height="600"
      class="w-full h-64 md:h-96 object-cover shadow-lg" 
      loading="eager"
    />
  </div>

  <div class="fixed top-0 left-0 right-0 p-0 text-center backdrop-blur-sm border-b-1 border-white/20 z-50">
    <div class="flex flex-wrap p-5 items-center justify-center mt-2">
      <img 
        src={project?.profile_image_url} 
        alt={project?.name} 
        width="80"
        height="80"
        class="w-20 h-20 mr-2 rounded-full" 
      />
      <div class="flex flex-col justify-start ml-2 text-shadow-lg">
        <h1 class="text-2xl md:text-3xl font-bold text-white">{project?.name}</h1>
        <span class="text-white text-left">{project?.location || ''}</span>
      </div>
    </div>
  </div>
</div> 