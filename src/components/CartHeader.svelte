<script lang="ts">
  import { onMount } from 'svelte';
  import { cartStore } from '$lib/stores/cart';
  
  interface Props {
    projectSlug: string;
  }
  
  let { projectSlug }: Props = $props();
  
  // Subscribe to cart store reactively using $state
  let itemCount = $state(0);
  let isLoading = $state(false);
  
  // Subscribe to cart store for reactive updates
  $effect(() => {
    const unsubscribe = cartStore.subscribe(cart => {
      itemCount = cart.summary?.itemCount || 0;
      isLoading = cart.loading;
    });
    
    return unsubscribe;
  });
  
  // Load cart data when component mounts
  onMount(async () => {
    try {
      await cartStore.load();
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  });
  
  // Determine cart URL based on project context
  const cartUrl = $derived(`/${projectSlug}/cart`);
</script>

<div class="flex items-center">
  <a 
    href={cartUrl} 
    class="relative inline-flex items-center p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
    aria-label="Shopping cart"
  >
    <!-- Shopping Cart Icon -->
    <svg 
      class="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M7 13h10M7 13l1.6 6.4M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
      />
    </svg>
    
    <!-- Cart Count Badge -->
    {#if itemCount > 0}
      <span 
        class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 dark:bg-red-500 rounded-full min-w-[1.5rem] h-6"
        aria-label="{itemCount} items in cart"
      >
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    {/if}
    
    <!-- Loading Indicator -->
    {#if isLoading}
      <span class="absolute -top-1 -right-1 inline-flex h-6 w-6">
        <span class="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-blue-300 opacity-75"></span>
      </span>
    {/if}
  </a>
</div> 