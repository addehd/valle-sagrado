<script>
  let { 
    estimates = [], 
    viewConfig, 
    formatCurrency,
    onpayment
  } = $props();
  
  function handlePaymentAll() {
    // For now, use the first estimate or create a combined one
    const totalAmount = estimates.reduce((sum, e) => sum + parseFloat(e.total_cost), 0);
    const combinedEstimate = estimates[0] ? {
      ...estimates[0],
      title: estimates.length > 1 ? `${estimates.length} Estimates` : estimates[0].title,
      total_cost: totalAmount,
      service_name: estimates.length > 1 ? 'Multiple Services' : estimates[0].service_name
    } : null;
    
    if (combinedEstimate) {
      onpayment?.(combinedEstimate);
    }
  }
</script>

{#if estimates.length > 0 && viewConfig.showPricing}
  <div>
    <div class="space-y-4">
      {#each estimates as estimate}
        <div class="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm transition-colors duration-200">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-xl font-bold text-gray-900 dark:text-neutral-100">{estimate.title}</h3>
          </div>
          <p class="text-gray-700 dark:text-neutral-300 font-medium mb-2">{estimate.service_name}</p>
          {#if estimate.description}
            <p class="text-gray-600 dark:text-neutral-400 text-sm mb-3">{estimate.description}</p>
          {/if}
          <div class="flex items-center gap-6 text-sm text-gray-600 dark:text-neutral-400">
            <span><strong>Hours:</strong> {estimate.estimated_hours}h</span>
            <span><strong>Rate:</strong> {formatCurrency(estimate.hourly_rate)}/h</span>
            <span class="text-lg font-bold text-gray-900 dark:text-neutral-100">
              <strong>Cost: {formatCurrency(estimate.total_cost)}</strong>
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
