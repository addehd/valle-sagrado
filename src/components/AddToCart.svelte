<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  interface Props {
    productSku: string;
    productName?: string;
    quantity?: number;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'outline';
  }

  let {
    productSku,
    productName = '',
    quantity = 1,
    disabled = false,
    size = 'md',
    variant = 'primary'
  }: Props = $props();

  let loading = $state(false);
  let message = $state('');
  let messageType = $state<'success' | 'error' | ''>('');

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
  };

  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;

  const handleSubmit: SubmitFunction = () => {
    loading = true;
    message = '';
    messageType = '';

    return async ({ result, update }) => {
      loading = false;
      
      if (result.type === 'success') {
        message = `${productName || 'Product'} added to cart!`;
        messageType = 'success';
        
        // Clear message after 3 seconds
        setTimeout(() => {
          message = '';
          messageType = '';
        }, 3000);
      } else if (result.type === 'failure') {
        message = result.data?.error || 'Failed to add to cart';
        messageType = 'error';
      }
      
      await update();
    };
  };
</script>

<div class="add-to-cart-wrapper">
  <form method="POST" action="?/addToCart" use:enhance={handleSubmit}>
    <input type="hidden" name="product_sku" value={productSku} />
    <input type="hidden" name="quantity" value={quantity} />
    
    <button 
      type="submit" 
      class={buttonClasses}
      disabled={disabled || loading || !productSku}
    >
      {#if loading}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Adding...
      {:else}
        Add to Cart
      {/if}
    </button>
  </form>

  {#if message}
    <div class="mt-2 text-sm {messageType === 'success' ? 'text-green-600' : 'text-red-600'}">
      {message}
    </div>
  {/if}
</div> 