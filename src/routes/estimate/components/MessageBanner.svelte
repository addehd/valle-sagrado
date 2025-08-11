<script>
  let { form } = $props();
</script>

{#if form?.error}
  <div class="mb-6 p-4 bg-red-50 dark:bg-neutral-700 border border-red-200 dark:border-neutral-600 rounded-lg">
    <p class="text-red-700 dark:text-neutral-300">{form.error}</p>
  </div>
{/if}

{#if form?.success}
  <div class="mb-6 p-4 bg-green-50 dark:bg-neutral-700 border border-green-200 dark:border-neutral-600 rounded-lg">
    <p class="text-green-700 dark:text-neutral-300">
      {form.message || 'Operation completed successfully!'}
    </p>
  </div>
{/if}