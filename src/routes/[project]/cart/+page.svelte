<script lang="ts">
  import { enhance } from '$app/forms';
  
  let { data } = $props();
</script>

<svelte:head>
  <title>Shopping Cart - {data.projectSlug}</title>
</svelte:head>

<main class="container mx-auto px-6 py-12">
  <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

  {#if !data.session?.user}
    <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
      <p>Please <a href="/login" class="underline font-medium">log in</a> to view your cart.</p>
    </div>
  {:else if data.cartItems.length === 0}
    <div class="text-center py-12">
      <h2 class="text-xl text-gray-600 mb-4">Your cart is empty</h2>
      <a 
        href="/{data.projectSlug}" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Continue Shopping
      </a>
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Cart Items -->
      <div class="divide-y divide-gray-200">
        {#each data.cartItems as item (item.id)}
          <div class="p-6 flex items-center space-x-4">
            <!-- Product Image -->
            <div class="flex-shrink-0">
              <a href="/{data.projectSlug}/product/{item.product?.slug || item.product_sku}">
                <img 
                  src={item.product?.images?.[0] || '/images/placeholder.jpg'} 
                  alt={item.product?.name || 'Product'} 
                  class="h-16 w-16 rounded-lg object-cover hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
            
            <!-- Product Details -->
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-gray-900 truncate">
                <a 
                  href="/{data.projectSlug}/product/{item.product?.slug || item.product_sku}"
                  class="hover:text-blue-600 transition-colors"
                >
                  {item.product?.name || 'Unknown Product'}
                </a>
              </h3>
              <p class="text-sm text-gray-500">SKU: {item.product_sku}</p>
              <p class="text-lg font-medium text-gray-900">
                {item.product?.price || 0} {item.product?.currency || 'USD'}
              </p>
            </div>
            
            <!-- Quantity Controls -->
            <div class="flex items-center space-x-2">
              <form method="POST" action="?/updateQuantity" use:enhance>
                <input type="hidden" name="product_sku" value={item.product_sku} />
                <input type="hidden" name="quantity" value={item.quantity - 1} />
                <button 
                  type="submit"
                  class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  -
                </button>
              </form>
              
              <span class="w-12 text-center font-medium">{item.quantity}</span>
              
              <form method="POST" action="?/updateQuantity" use:enhance>
                <input type="hidden" name="product_sku" value={item.product_sku} />
                <input type="hidden" name="quantity" value={item.quantity + 1} />
                <button 
                  type="submit"
                  class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </form>
            </div>
            
            <!-- Item Total -->
            <div class="text-right">
              <p class="text-lg font-medium text-gray-900">
                {((item.product?.price || 0) * item.quantity).toFixed(2)} {item.product?.currency || 'USD'}
              </p>
            </div>
            
            <!-- Remove Button -->
            <form method="POST" action="?/removeItem" use:enhance>
              <input type="hidden" name="product_sku" value={item.product_sku} />
              <button 
                type="submit"
                class="text-red-600 hover:text-red-800 p-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </form>
          </div>
        {/each}
      </div>
      
      <!-- Cart Summary -->
      <div class="bg-gray-50 px-6 py-4">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-medium">Total Items:</span>
          <span class="text-lg font-medium">{data.totalItems}</span>
        </div>
        <div class="flex justify-between items-center mb-6">
          <span class="text-xl font-bold">Total Price:</span>
          <span class="text-xl font-bold">${data.totalPrice.toFixed(2)}</span>
        </div>
        
        <div class="flex space-x-4">
          <form method="POST" action="?/clearCart" use:enhance class="flex-1">
            <button 
              type="submit"
              class="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Clear Cart
            </button>
          </form>
          
          <a
            href="/{data.projectSlug}/checkout"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
          >
            Proceed to Checkout
          </a>
        </div>
      </div>
    </div>
  {/if}
</main> 