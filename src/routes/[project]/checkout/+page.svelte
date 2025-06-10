<script lang="ts">
  import { enhance } from '$app/forms';
  import CartHeader from '../../../components/CartHeader.svelte';
  
  let { data } = $props();
  
  let isSubmitting = $state(false);
  
  // Calculate display values
  const totalItems = $derived(data.cartItems.reduce((total, item) => total + item.quantity, 0));
  const projectSlug = $derived(data.project?.url || '');
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
</script>

<svelte:head>
  <title>Checkout - {data.project?.name || 'Store'}</title>
</svelte:head>

<main class="container mx-auto px-6 py-8 max-w-6xl">
  <!-- Header with Cart -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Checkout</h1>
      <p class="text-gray-600 mt-1">Complete your order for {data.project?.name}</p>
    </div>
    
    <div class="flex items-center space-x-4">
      <CartHeader projectSlug={projectSlug} />
      <a 
        href="/{projectSlug}/cart"
        class="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
      >
        ← Back to Cart
      </a>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Left Column: Shipping Form -->
    <div class="lg:col-span-2">
      <form method="POST" action="?/placeOrder" use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          isSubmitting = false;
          await update();
        };
      }}>
        <!-- Shipping Information -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div class="md:col-span-2">
              <label for="shipping_name" class="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="shipping_name"
                name="shipping_name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            
            <!-- Email -->
            <div>
              <label for="shipping_email" class="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="shipping_email"
                name="shipping_email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
            
            <!-- Phone -->
            <div>
              <label for="shipping_phone" class="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="shipping_phone"
                name="shipping_phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <!-- Address Line 1 -->
            <div class="md:col-span-2">
              <label for="shipping_address_line1" class="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                id="shipping_address_line1"
                name="shipping_address_line1"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>
            
            <!-- Address Line 2 -->
            <div class="md:col-span-2">
              <label for="shipping_address_line2" class="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                id="shipping_address_line2"
                name="shipping_address_line2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Apartment, suite, etc."
              />
            </div>
            
            <!-- City -->
            <div>
              <label for="shipping_city" class="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="shipping_city"
                name="shipping_city"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="New York"
              />
            </div>
            
            <!-- State -->
            <div>
              <label for="shipping_state" class="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                id="shipping_state"
                name="shipping_state"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="NY"
              />
            </div>
            
            <!-- Postal Code -->
            <div>
              <label for="shipping_postal_code" class="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                id="shipping_postal_code"
                name="shipping_postal_code"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10001"
              />
            </div>
            
            <!-- Country -->
            <div>
              <label for="shipping_country" class="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                id="shipping_country"
                name="shipping_country"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="MX">Mexico</option>
                <option value="GB">United Kingdom</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="AU">Australia</option>
                <option value="JP">Japan</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Payment Information (Placeholder) -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-blue-800 text-sm">
                <strong>Demo Mode:</strong> This is a demo checkout. No real payment will be processed. 
                Your order will be created as "pending" for demonstration purposes.
              </p>
            </div>
          </div>
        </div>

        <!-- Place Order Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center"
          >
            {#if isSubmitting}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Order...
            {:else}
              Place Order
            {/if}
          </button>
        </div>
      </form>
    </div>

    <!-- Right Column: Order Summary -->
    <div>
      <div class="bg-white rounded-lg shadow-sm p-6 sticky top-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
        
        <!-- Cart Items -->
        <div class="space-y-4 mb-6">
          {#each data.cartItems as item}
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <img 
                  src={item.products?.images?.[0] || '/images/placeholder.jpg'} 
                  alt={item.products?.name || 'Product'} 
                  class="w-12 h-12 rounded-lg object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {item.products?.name || 'Unknown Product'}
                </p>
                <p class="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div class="text-sm font-medium text-gray-900">
                {formatCurrency((item.products?.price || 0) * item.quantity)}
              </div>
            </div>
          {/each}
        </div>
        
        <!-- Totals -->
        <div class="border-t border-gray-200 pt-4 space-y-3">
                     <div class="flex justify-between text-sm">
             <span class="text-gray-600">Subtotal ({totalItems} items):</span>
             <span class="text-gray-900">{formatCurrency(data.subtotal || 0)}</span>
           </div>
           
           <div class="flex justify-between text-sm">
             <span class="text-gray-600">Shipping:</span>
             <span class="text-gray-900">
               {(data.shippingCost || 0) > 0 ? formatCurrency(data.shippingCost || 0) : 'Free'}
             </span>
           </div>
           
           <div class="flex justify-between text-sm">
             <span class="text-gray-600">Tax:</span>
             <span class="text-gray-900">{formatCurrency(data.taxAmount || 0)}</span>
           </div>
          
                     <div class="border-t border-gray-200 pt-3">
             <div class="flex justify-between font-semibold text-lg">
               <span class="text-gray-900">Total:</span>
               <span class="text-gray-900">{formatCurrency(data.totalAmount || 0)}</span>
             </div>
           </div>
        </div>
        
        <!-- Security Note -->
        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <span>Secure checkout powered by demo system</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</main> 