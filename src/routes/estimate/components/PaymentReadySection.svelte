<script>
  let { 
    estimates = [], 
    viewConfig, 
    formatCurrency,
    onpayment
  } = $props();
  
  function handlePayment(estimate) {
    onpayment?.(estimate);
  }
</script>

{#if estimates.length > 0 && viewConfig.showPricing}
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-6">💳 Ready for Payment</h2>
    <div class="space-y-4">
      {#each estimates as estimate}
        <div class="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm transition-colors duration-200">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-bold text-gray-900 dark:text-neutral-100">{estimate.title}</h3>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700">
                  ✅ Approved
                </span>
              </div>
              <p class="text-gray-700 dark:text-neutral-300 font-medium mb-2">{estimate.service_name}</p>
              {#if estimate.description}
                <p class="text-gray-600 dark:text-neutral-400 text-sm mb-3">{estimate.description}</p>
              {/if}
              <div class="flex items-center gap-6 text-sm text-gray-600 dark:text-neutral-400">
                <span><strong>Hours:</strong> {estimate.estimated_hours}h</span>
                <span><strong>Rate:</strong> {formatCurrency(estimate.hourly_rate)}/h</span>
                <span class="text-lg font-bold text-gray-900 dark:text-neutral-100">
                  <strong>Total: {formatCurrency(estimate.total_cost)}</strong>
                </span>
              </div>
            </div>
            <div class="flex-shrink-0">
              <button
                onclick={() => handlePayment(estimate)}
                class="w-full lg:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                💳 Pay {formatCurrency(estimate.total_cost)}
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}