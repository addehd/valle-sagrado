<script lang="ts">
  import { onMount } from 'svelte';
  import { cartStore } from '$lib/stores/cart';
  import { page } from '$app/stores';
  
  interface Props {
    projectSlug?: string;
  }
  
  let { projectSlug }: Props = $props();
  
  let totalItems = $state(0);
  let loading = $state(false);
  
  // Subscribe to cart store for reactive updates
  cartStore.subscribe(cart => {
    totalItems = cart.totalItems;
    loading = cart.loading;
  });
  
  // Load initial cart count when component mounts
  onMount(async () => {
    // Get session from page data
    const session = $page.data?.session;
    const supabase = $page.data?.supabase;
    
    if (session?.user && supabase) {
      await cartStore.refreshTotals(supabase, session.user.id);
    }
  });
  
  // Determine cart URL based on whether we have a project context
  const cartUrl = $derived(projectSlug ? `/${projectSlug}/cart` : '/cart');
</script>

<a 
  href={cartUrl} 
  class="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
  aria-label="Shopping cart"
>
  <!-- Cart Icon -->
  <svg 
    class="w-6 h-6" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
    />
  </svg>
  
  <!-- Item Count Badge -->
  {#if totalItems > 0}
    <span 
      class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
      class:animate-pulse={loading}
    >
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  {/if}
</a> 