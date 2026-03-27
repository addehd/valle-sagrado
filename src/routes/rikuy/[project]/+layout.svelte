<script lang="ts">
  import type { LayoutData } from './$types';
  import ProjectHero from '$components/ProjectHero.svelte';
  import MetaTags from '$components/MetaTags.svelte';
  import { page } from '$app/stores';

  let { data, children }: { data: LayoutData, children: any } = $props();
  
  // Derive current URL for meta tags
  const currentUrl = $derived($page.url.href);
  
  // Create project-specific meta tags
  const projectTitle = $derived(data.project?.name ? `${data.project.name} - Valle Sagrado` : 'Valle Sagrado');
  const projectDescription = $derived(
    data.project?.project_info?.slice(0, 160) || 
    (data.project?.name ? `Discover ${data.project.name} in Valle Sagrado. Connect with local guides and authentic experiences.` : 'Discover unique local projects, artisans, and experiences from the Sacred Valley.')
  );
  const projectImage = $derived(
    data.project?.hero_img || 
    data.project?.profile_image_url || 
    data.project?.logo_url || 
    '/images/valle.jpg'
  );
  const projectKeywords = $derived(
    data.project?.tags?.join(', ') || 
    'Valle Sagrado, Sacred Valley, Peru, local artisans, authentic experiences, Peruvian culture, tourism, handmade products'
  );
</script>

<!-- Project-specific Meta Tags -->
<MetaTags 
  title={projectTitle}
  description={projectDescription}
  image={projectImage}
  url={currentUrl}
  keywords={projectKeywords}
  type="website"
/>

<!-- Dynamic favicon -->
<svelte:head>
  {#if data.project?.fav || data.project?.logo_url || data.project?.profile_image_url || data.project?.hero_img}
    <link rel="icon" href={data.project.fav || data.project.logo_url || data.project.profile_image_url || data.project.hero_img} />
  {:else}
    <!-- Fallback to default favicon -->
    <link rel="icon" href="/favicon.png" />
  {/if}
</svelte:head>

<!-- Shared Hero Section for all project pages -->
{#if data.project}
  <ProjectHero project={data.project} />
{/if}

{@render children()} 