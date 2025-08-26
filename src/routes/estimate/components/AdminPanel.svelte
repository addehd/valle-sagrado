<script>
  import EstimateForm from './EstimateForm.svelte';
  
  let { 
    showCreateForm = $bindable(false),
    editingEstimate = $bindable(null),
    loading = $bindable(false),
    onformcancel,
    onformsuccess,
    estimates = [],
    payableEstimates = [],
    onpayment,
    showCost = false,
    formatCurrency
  } = $props();
  
  function toggleForm() {
    showCreateForm = !showCreateForm;
  }
  
  function handleFormCancel() {
    onformcancel?.();
  }
  
  function handleFormSuccess() {
    onformsuccess?.();
  }

  function handlePaymentAll() {
    // Use payable estimates for payment
    const totalAmount = payableEstimates.reduce((sum, e) => sum + parseFloat(e.total_cost), 0);
    const combinedEstimate = payableEstimates[0] ? {
      ...payableEstimates[0],
      title: payableEstimates.length > 1 ? `${payableEstimates.length} Estimates` : payableEstimates[0].title,
      total_cost: totalAmount,
      service_name: payableEstimates.length > 1 ? 'Multiple Services' : payableEstimates[0].service_name
    } : null;
    
    if (combinedEstimate) {
      onpayment?.(combinedEstimate);
    }
  }

  // Calculate total amount for display
  const totalPayableAmount = payableEstimates.reduce((sum, e) => sum + parseFloat(e.total_cost), 0);
</script>

<div class="mb-8 mt-6">
  <div class="flex items-center justify-end mb-4">
    <div class="flex space-x-3 bg">
      
      {#if showCost && payableEstimates.length > 0}
        <button
          onclick={handlePaymentAll}
          class="inline-flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
          💳 Pay Now {formatCurrency(totalPayableAmount)}
        </button>
      {/if}
      <button
        onclick={toggleForm}
        class="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
        {showCreateForm ? 'Cancel' : 'Add New Estimate'}
      </button>
    </div>
  </div>

  {#if showCreateForm}
    <EstimateForm
      {editingEstimate}
      {loading}
      oncancel={handleFormCancel}
      onsuccess={handleFormSuccess} />
  {/if}
</div>