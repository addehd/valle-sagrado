<script lang="ts">
  const projects = [
    { name: 'Rikuy', path: '/rikuy', domain: 'rikuy.one' },
    { name: 'Maria Ocampo', path: '/maria', domain: 'mariaocampo.se' },
    { name: 'Danny Cranmer', path: '/danny', domain: 'cranmer.se' }
  ]
</script>

<div class="min-h-screen bg-zinc-900 text-white p-8">
  <h1 class="text-2xl font-bold mb-8">Dev Routes</h1>
  
  <div class="grid gap-4 max-w-md">
    {#each projects as project}
      <a
        href="{project.path}"
        class="block p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
        <div class="font-semibold">{project.name}</div>
        <div class="text-sm text-zinc-400">{project.domain}</div>
      </a>
    {/each}
  </div>
  
  <p class="mt-8 text-sm text-zinc-500">
    Or use <code class="bg-zinc-800 px-1 rounded">?domain=rikuy|maria|danny</code> to simulate domain routing
  </p>
</div>
