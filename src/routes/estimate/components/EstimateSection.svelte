<script>
  import EstimateCard from './EstimateCard.svelte';
  
  let { 
    title, 
    estimates = [], 
    viewConfig, 
    user = null, 
    isCompleted = false, 
    gridLayout = true,
    onedit
  } = $props();
  
  function handleEdit(estimate) {
    onedit?.(estimate);
  }
</script>

{#if estimates.length > 0}
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-6">{title}</h2>
    <div class={gridLayout ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
      {#each estimates as estimate}
        <EstimateCard
          {estimate}
          config={viewConfig}
          isLoggedIn={!!user}
          onEdit={handleEdit}
          {isCompleted}
          showCost={viewConfig.showPricing} />
      {/each}
    </div>
  </div>
{/if}