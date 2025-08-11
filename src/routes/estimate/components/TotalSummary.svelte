<script>
  let { totalValues, formatCurrency } = $props();
</script>

<div class="mt-12 p-6 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
  <!-- Background image with blur -->
  <div class="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"></div>
  <!-- Dark overlay for better text readability -->
  <div class="absolute inset-0 bg-black/30 dark:bg-black/60"></div>
  <!-- Content wrapper -->
  <div class="relative z-10 text-white">
    <h3 class="text-xl font-semibold mb-4">💰 Total Project Value Summary</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-400">
          {formatCurrency(totalValues.pending)}
        </div>
        <div class="text-gray-300">Pending Estimates</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-green-400">
          {formatCurrency(totalValues.completed)}
        </div>
        <div class="text-gray-300">Completed Projects</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-yellow-400">
          {formatCurrency(totalValues.total)}
        </div>
        <div class="text-gray-300">Total Value</div>
      </div>
    </div>
  </div>
</div>