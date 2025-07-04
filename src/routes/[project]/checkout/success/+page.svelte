<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let paymentIntentId = '';
  let orderNumber = '';

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    paymentIntentId = urlParams.get('payment_intent') || '';
    orderNumber = urlParams.get('order_number') || '';
  });
</script>

<svelte:head>
  <title>Order Confirmed - {$page.params.project}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="px-6 py-8 text-center">
        <!-- Success Icon -->
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p class="text-lg text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {#if paymentIntentId}
          <div class="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Payment ID:</span>
                <span class="font-mono text-gray-900">{paymentIntentId}</span>
              </div>
              {#if orderNumber}
                <div class="flex justify-between">
                  <span class="text-gray-600">Order Number:</span>
                  <span class="font-mono text-gray-900">{orderNumber}</span>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 class="text-lg font-semibold text-blue-900 mb-2">What's Next?</h3>
          <div class="text-sm text-blue-800 space-y-2">
            <p>• You'll receive an order confirmation email shortly</p>
            <p>• We'll send you tracking information once your order ships</p>
            <p>• Your order will be processed within 1-2 business days</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/{$page.params.project}"
            class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </a>
          <a
            href="/account/orders"
            class="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            View Orders
          </a>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            Questions about your order? 
            <a href="/contact" class="text-blue-600 hover:text-blue-800 underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div> 