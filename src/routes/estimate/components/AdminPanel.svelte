<script>
  import EstimateForm from './EstimateForm.svelte';
  
  let { 
    showCreateForm = $bindable(false),
    editingEstimate = $bindable(null),
    loading = $bindable(false),
    onformcancel,
    onformsuccess
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
</script>

<div class="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-neutral-100">Manage Estimates</h2>
    <div class="flex space-x-3">
      <a
        href="/api/stripe/test"
        target="_blank"
        class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-neutral-600 text-sm font-medium rounded-md text-gray-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
        🔧 Test Stripe
      </a>
      <button
        onclick={toggleForm}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
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