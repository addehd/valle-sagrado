<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { getAllProjects, getProjectConfig } from '$lib/config/projects';

  const projects = getAllProjects();
  let activeDomain = $state<string | null>(null);
  let activeConfig = $derived(activeDomain ? getProjectConfig(activeDomain) : null);

  function getCookie(name: string): string | null {
    if (!browser) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  function setCookie(name: string, value: string, days: number = 7) {
    if (!browser) return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  function clearCookie(name: string) {
    if (!browser) return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  async function handleLinkClick(project: ReturnType<typeof getAllProjects>[0], event: MouseEvent) {
    event.preventDefault();
    setCookie('dev-domain-preference', project.key);
    activeDomain = project.key;
    
    // Update favicon and title
    if (browser) {
      document.title = project.meta.title;
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) {
        link.href = project.meta.favicon;
      }
    }
    
    await goto(project.path);
  }

  function handleClearCookie() {
    clearCookie('dev-domain-preference');
    activeDomain = null;
    // Reload to reset routing
    if (browser) {
      window.location.href = '/';
    }
  }

  onMount(() => {
    if (browser) {
      activeDomain = getCookie('dev-domain-preference');
    }
  });
</script>

<svelte:head>
  {#if activeConfig}
    <title>{activeConfig.meta.title}</title>
    <meta name="description" content="{activeConfig.meta.description}" />
    <link rel="icon" type="image/svg+xml" href="{activeConfig.meta.favicon}" />
  {:else}
    <title>Dev Routes - Project Selector</title>
    <meta name="description" content="Select a project to view" />
  {/if}
</svelte:head>

<div class="min-h-screen bg-zinc-900 text-white p-8">
  <h1 class="text-2xl font-bold mb-8">Dev Routes</h1>
  
  {#if activeDomain && activeConfig}
    <div class="mb-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <img src="{activeConfig.meta.favicon}" alt="{activeConfig.name} icon" class="w-8 h-8" />
          <div>
            <div class="font-semibold">{activeConfig.name}</div>
            <div class="text-xs text-zinc-400">{activeConfig.domain}</div>
          </div>
        </div>
        <button
          onclick={handleClearCookie}
          class="text-xs px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors">
          Clear
        </button>
      </div>
      <div class="text-sm space-y-2 pt-3 border-t border-zinc-700">
        <div>
          <span class="text-zinc-400">Title:</span>
          <span class="ml-2">{activeConfig.meta.title}</span>
        </div>
        <div>
          <span class="text-zinc-400">Description:</span>
          <span class="ml-2 text-zinc-300">{activeConfig.meta.description}</span>
        </div>
        <div>
          <span class="text-zinc-400">Features:</span>
          <span class="ml-2">
            {#each Object.entries(activeConfig.features) as [feature, enabled]}
              {#if enabled}
                <span class="inline-block px-2 py-0.5 bg-zinc-700 rounded text-xs mr-1">{feature}</span>
              {/if}
            {/each}
          </span>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="grid gap-4 max-w-2xl">
    {#each projects as project}
      <a
        href="{project.path}"
        onclick={(e) => handleLinkClick(project, e)}
        class="block p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors {activeDomain === project.key ? 'ring-2 ring-blue-500' : ''}">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-3 flex-1">
            <img src="{project.meta.favicon}" alt="{project.name} icon" class="w-8 h-8 mt-0.5" />
            <div class="flex-1">
              <div class="font-semibold">{project.name}</div>
              <div class="text-sm text-zinc-400 mb-2">{project.domain}</div>
              <div class="text-xs text-zinc-500">{project.meta.description}</div>
            </div>
          </div>
          {#if activeDomain === project.key}
            <div class="text-blue-400 text-sm shrink-0">✓ Active</div>
          {/if}
        </div>
      </a>
    {/each}
  </div>
  
  <p class="mt-8 text-sm text-zinc-500">
    Or use <code class="bg-zinc-800 px-1 rounded">?domain=rikuy|maria|danny|tryckbart</code> to simulate domain routing
  </p>
</div>
