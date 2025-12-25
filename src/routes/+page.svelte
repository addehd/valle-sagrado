<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

  const projects = [
    { name: 'Rikuy', path: '/rikuy', domain: 'rikuy.one', key: 'rikuy' },
    { name: 'Maria Ocampo', path: '/maria', domain: 'mariaocampo.se', key: 'maria' },
    { name: 'Danny Cranmer', path: '/danny', domain: 'cranmer.se', key: 'danny' }
  ];

  let activeDomain = $state<string | null>(null);

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

  async function handleLinkClick(project: typeof projects[0], event: MouseEvent) {
    event.preventDefault();
    setCookie('dev-domain-preference', project.key);
    activeDomain = project.key;
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

<div class="min-h-screen bg-zinc-900 text-white p-8">
  <h1 class="text-2xl font-bold mb-8">Dev Routes</h1>
  
  {#if activeDomain}
    <div class="mb-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
      <div class="flex items-center justify-between">
        <div class="text-sm">
          <span class="text-zinc-400">Active domain:</span>
          <span class="font-semibold ml-2">{activeDomain}</span>
        </div>
        <button
          onclick={handleClearCookie}
          class="text-xs px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors">
          Clear
        </button>
      </div>
    </div>
  {/if}
  
  <div class="grid gap-4 max-w-md">
    {#each projects as project}
      <a
        href="{project.path}"
        onclick={(e) => handleLinkClick(project, e)}
        class="block p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors {activeDomain === project.key ? 'ring-2 ring-blue-500' : ''}">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold">{project.name}</div>
            <div class="text-sm text-zinc-400">{project.domain}</div>
          </div>
          {#if activeDomain === project.key}
            <div class="text-blue-400 text-sm">✓ Active</div>
          {/if}
        </div>
      </a>
    {/each}
  </div>
  
  <p class="mt-8 text-sm text-zinc-500">
    Or use <code class="bg-zinc-800 px-1 rounded">?domain=rikuy|maria|danny</code> to simulate domain routing
  </p>
</div>
