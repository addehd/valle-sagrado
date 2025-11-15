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
      class="w-full h-64 md:h-96 object-cover shadow-lg" 
    />
  </div>

  <div class="fixed top-0 left-0 right-0 p-0 text-center backdrop-blur-sm border-b-1 border-white/20 z-50">
    <div class="flex flex-col md:flex-row flex-wrap p-5 items-center justify-center mt-2 gap-2 md:gap-0">
      <img
        src={project?.profile_image_url}
        alt={project?.name}
        class="w-20 h-20 md:mr-2 rounded-full"
      />
      <div class="flex flex-col justify-start md:ml-2 text-shadow-lg items-center md:items-start">
        <h1 class="text-2xl md:text-3xl font-bold text-white text-center md:text-left">{project?.name}</h1>
        <span class="text-white text-center md:text-left">{project?.location || ''}</span>
      </div>
    </div>
  </div>
</div> 