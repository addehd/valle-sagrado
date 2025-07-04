<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;

  // Helper function to format timestamp
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  // Helper function to get preview size text
  function getPreviewSize(metadata: any) {
    if (metadata?.previewSize) {
      return `${metadata.previewSize.width}×${metadata.previewSize.height}`;
    }
    return 'Unknown';
  }

  // Helper function to update URL with filters
  function updateFilters(newFramework?: string, newSource?: string) {
    const url = new URL($page.url);
    
    // Reset to page 1 when filtering
    url.searchParams.set('page', '1');
    
    if (newFramework) {
      url.searchParams.set('framework', newFramework);
    } else {
      url.searchParams.delete('framework');
    }
    
    if (newSource) {
      url.searchParams.set('source', newSource);
    } else {
      url.searchParams.delete('source');
    }
    
    goto(url.toString());
  }

  // Helper function to change page
  function changePage(newPage: number) {
    const url = new URL($page.url);
    url.searchParams.set('page', newPage.toString());
    goto(url.toString());
  }
</script>

<svelte:head>
  <title>Igma - Banner Gallery</title>
  <meta name="description" content="Browse and view Figma banner exports stored in Supabase" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      Banner Gallery
    </h1>
    <p class="text-gray-600 dark:text-gray-300">
      Browse {data.pagination.total} banner{data.pagination.total !== 1 ? 's' : ''} from Figma exports
    </p>
  </div>

  <!-- Filters -->
  <div class="mb-6 flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div class="flex flex-col">
      <label for="framework-filter" class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Framework
      </label>
      <select 
        id="framework-filter"
        class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        value={data.filters.selectedFramework || ''}
        on:change={(e) => updateFilters(e.currentTarget.value || undefined, data.filters.selectedSource || undefined)}
      >
        <option value="">All Frameworks</option>
        {#each data.filters.frameworks as framework}
          <option value={framework}>{framework}</option>
        {/each}
      </select>
    </div>

    <div class="flex flex-col">
      <label for="source-filter" class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Source
      </label>
      <select 
        id="source-filter"
        class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        value={data.filters.selectedSource || ''}
        on:change={(e) => updateFilters(data.filters.selectedFramework || undefined, e.currentTarget.value || undefined)}
      >
        <option value="">All Sources</option>
        {#each data.filters.sources as source}
          <option value={source}>{source}</option>
        {/each}
      </select>
    </div>

    <!-- Clear filters button -->
    {#if data.filters.selectedFramework || data.filters.selectedSource}
      <div class="flex flex-col justify-end">
        <button 
          class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          on:click={() => updateFilters()}
        >
          Clear Filters
        </button>
      </div>
    {/if}
  </div>

  <!-- Banner Grid -->
  {#if data.banners.length > 0}
    <div class="grid auto-rows-auto gap-6 mb-8">
      {#each data.banners as banner}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <!-- Banner Preview -->
          <div class="p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-auto">
            <div class="flex-shrink-0 w-full h-full">
              {@html banner.html}
            </div>
          </div>
          
          <!-- Banner Info -->
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <span class="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {banner.framework}
              </span>
              <span class="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {banner.source}
              </span>
            </div>
            
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div class="flex justify-between">
                <span>Size:</span>
                <span>{getPreviewSize(banner.metadata)}</span>
              </div>
              <div class="flex justify-between">
                <span>Created:</span>
                <span>{formatDate(banner.created_at)}</span>
              </div>
              <div class="flex justify-between">
                <span>ID:</span>
                <span class="font-mono text-xs truncate max-w-[100px]" title={banner.id}>
                  {banner.id.slice(0, 8)}...
                </span>
              </div>
            </div>

            <!-- Settings Preview -->
            {#if banner.settings && Object.keys(banner.settings).length > 0}
              <details class="mt-3">
                <summary class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                  Settings
                </summary>
                <div class="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  <pre class="whitespace-pre-wrap">{JSON.stringify(banner.settings, null, 2)}</pre>
                </div>
              </details>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    {#if data.pagination.totalPages > 1}
      <div class="flex justify-center items-center space-x-2">
        <!-- Previous button -->
        <button 
          class="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          disabled={!data.pagination.hasPrev}
          on:click={() => changePage(data.pagination.page - 1)}
        >
          Previous
        </button>

        <!-- Page numbers -->
        {#each Array.from({length: Math.min(5, data.pagination.totalPages)}, (_, i) => {
          const start = Math.max(1, data.pagination.page - 2);
          return start + i;
        }).filter(p => p <= data.pagination.totalPages) as pageNum}
          <button 
            class="px-3 py-2 text-sm rounded-md transition-colors {pageNum === data.pagination.page 
              ? 'bg-blue-500 text-white' 
              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}"
            on:click={() => changePage(pageNum)}
          >
            {pageNum}
          </button>
        {/each}

        <!-- Next button -->
        <button 
          class="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          disabled={!data.pagination.hasNext}
          on:click={() => changePage(data.pagination.page + 1)}
        >
          Next
        </button>
      </div>

      <!-- Pagination info -->
      <div class="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} banners
      </div>
    {/if}
  {:else}
    <!-- Empty state -->
    <div class="text-center py-12">
      <div class="text-gray-400 dark:text-gray-600 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No banners found</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {#if data.filters.selectedFramework || data.filters.selectedSource}
          Try adjusting your filters or clearing them to see more results.
        {:else}
          There are no banners in the database yet. Try creating some using the Figma export API.
        {/if}
      </p>
      
      {#if data.filters.selectedFramework || data.filters.selectedSource}
        <button 
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          on:click={() => updateFilters()}
        >
          Clear Filters
        </button>
      {:else}
        <a 
          href="/figma" 
          class="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Go to Figma Export Tool
        </a>
      {/if}
    </div>
  {/if}
</div> 