<script lang="ts">
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData, children: any } = $props();
</script>

<svelte:head>
  <title>{data.project?.name ? `${data.project.name} - Valle Sagrado` : 'Valle Sagrado'}</title>
  {#if data.project?.project_info}
    <meta name="description" content={data.project.project_info.slice(0, 160)} />
  {:else if data.project?.name}
    <meta name="description" content={`Discover ${data.project.name} in Valle Sagrado. Connect with local guides and authentic experiences.`} />
  {/if}
  {#if data.project?.logo_url || data.project?.profile_image_url || data.project?.hero_img}
    <link rel="icon" href={data.project.logo_url || data.project.profile_image_url || data.project.hero_img} />
  {:else}
    <!-- Fallback to default favicon -->
    <link rel="icon" href="/favicon.png" />
  {/if}
</svelte:head>

{@render children()} 