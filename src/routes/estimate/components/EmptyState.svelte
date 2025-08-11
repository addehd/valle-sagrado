<script>
  let { user = null, oncreateFirst } = $props();
  
  function handleCreateFirst() {
    oncreateFirst?.();
  }
</script>

<div class="text-center py-12">
  <div class="text-gray-500 dark:text-neutral-500 text-lg">No estimates available yet.</div>
  {#if user}
    <button
      onclick={handleCreateFirst}
      class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
      Create Your First Estimate
    </button>
  {/if}
</div>