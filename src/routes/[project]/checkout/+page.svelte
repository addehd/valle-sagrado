<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { cartStore } from '$lib/stores/cart';
  import { initializeStripe, createPaymentElement, processPayment } from '$lib/stores/stripe';
  import type { Stripe } from '@stripe/stripe-js';
  import type { PageData } from './$types';

  export let data: PageData;

  let stripe: Stripe | null = null;
  let paymentElement: any = null;
  let clientSecret = '';
  let isLoading = false;
  let paymentProcessing = false;
  let errorMessage = '';
  let successMessage = '';

  // Shipping form data
  let shippingInfo = {
    shipping_name: '',
    shipping_email: data.session?.user?.email || '',
    shipping_address_line1: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'US'
  };

  // Use server-side cart data
  $: cartItems = data.cartItems || [];
  $: subtotal = data.subtotal || 0;
  $: taxAmount = data.taxAmount || 0;
  $: shippingAmount = data.shippingCost || 0;
  $: totalAmount = data.totalAmount || 0;

  onMount(async () => {
    // Initialize Stripe
    stripe = await initializeStripe();
    
    // Check if cart is empty
    if (cartItems.length === 0) {
      goto(`/${$page.params.project}/cart`);
      return;
    }
  });

  async function createPaymentIntent() {
    if (!shippingInfo.shipping_name || !shippingInfo.shipping_email || !shippingInfo.shipping_address_line1) {
      errorMessage = 'Please fill in all required shipping information';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_slug: $page.params.project,
          shipping_info: shippingInfo,
          cart_items: cartItems.map(item => ({
            product_sku: item.product_sku,
            quantity: item.quantity
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment intent');
      }

      clientSecret = data.client_secret;

      if (data.mock_mode) {
        // In mock mode, show success immediately
        successMessage = `Mock payment created! Order: ${data.order.order_number}`;
        // Clear cart
        await cartStore.clear();
        return;
      }

      // Create payment element
      if (stripe && clientSecret) {
        paymentElement = await createPaymentElement(stripe, clientSecret);
        
        // Mount the payment element
        const paymentElementContainer = document.getElementById('payment-element');
        if (paymentElementContainer && paymentElement) {
          paymentElement.mount('#payment-element');
        }
      }

    } catch (error) {
      console.error('Error creating payment intent:', error);
      errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
    } finally {
      isLoading = false;
    }
  }

  async function handlePayment() {
    if (!stripe || !paymentElement || !clientSecret) {
      errorMessage = 'Payment system not ready';
      return;
    }

    paymentProcessing = true;
    errorMessage = '';

    const returnUrl = `${window.location.origin}/${$page.params.project}/checkout/success`;

    try {
      const result = await processPayment(stripe, clientSecret, paymentElement, returnUrl);

      if (result.error) {
        errorMessage = result.error.message || 'Payment failed';
      } else {
        // Payment succeeded
        successMessage = 'Payment successful! Redirecting...';
        
        // Clear cart
        await cartStore.clear();
        
        // Redirect to success page
        setTimeout(() => {
          goto(`/${$page.params.project}/checkout/success?payment_intent=${result.paymentIntent?.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      errorMessage = 'Payment processing failed';
    } finally {
      paymentProcessing = false;
    }
  }
</script>

<svelte:head>
  <title>Checkout - {$page.params.project}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        <!-- Order Summary -->
        <div class="order-2 lg:order-1">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          <div class="space-y-4">
            {#each cartItems as item}
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <h3 class="font-medium text-gray-900">{item.products.name}</h3>
                  <p class="text-sm text-gray-600">SKU: {item.product_sku}</p>
                  <p class="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">${(parseFloat(item.products.price) * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            {/each}
          </div>

          <div class="mt-6 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Tax</span>
              <span class="text-gray-900">${taxAmount.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Shipping</span>
              <span class="text-gray-900">Free</span>
            </div>
            <div class="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Shipping & Payment Form -->
        <div class="order-1 lg:order-2">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
          
          <form on:submit|preventDefault={createPaymentIntent} class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="shipping_name" class="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  id="shipping_name"
                  bind:value={shippingInfo.shipping_name}
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label for="shipping_email" class="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  id="shipping_email"
                  bind:value={shippingInfo.shipping_email}
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label for="shipping_address_line1" class="block text-sm font-medium text-gray-700">Address *</label>
              <input
                type="text"
                id="shipping_address_line1"
                bind:value={shippingInfo.shipping_address_line1}
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label for="shipping_city" class="block text-sm font-medium text-gray-700">City *</label>
                <input
                  type="text"
                  id="shipping_city"
                  bind:value={shippingInfo.shipping_city}
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label for="shipping_state" class="block text-sm font-medium text-gray-700">State *</label>
                <input
                  type="text"
                  id="shipping_state"
                  bind:value={shippingInfo.shipping_state}
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                              <label for="shipping_postal_code" class="block text-sm font-medium text-gray-700">ZIP *</label>
              <input
                type="text"
                id="shipping_postal_code"
                bind:value={shippingInfo.shipping_postal_code}
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {#if !clientSecret && !successMessage}
              <button
                type="submit"
                disabled={isLoading}
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Continue to Payment'}
              </button>
            {/if}
          </form>

          <!-- Payment Element -->
          {#if clientSecret && !successMessage}
            <div class="mt-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div id="payment-element" class="mb-4"></div>
              
              <button
                on:click={handlePayment}
                disabled={paymentProcessing}
                class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentProcessing ? 'Processing Payment...' : `Pay $${totalAmount.toFixed(2)}`}
              </button>
            </div>
          {/if}

          <!-- Messages -->
          {#if errorMessage}
            <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p class="text-red-800">{errorMessage}</p>
            </div>
          {/if}

          {#if successMessage}
            <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p class="text-green-800">{successMessage}</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div> 