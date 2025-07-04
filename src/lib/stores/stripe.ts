import { writable } from 'svelte/store';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { env } from '$env/dynamic/public';

// Stripe instance store
export const stripeStore = writable<Stripe | null>(null);

// Loading state
export const stripeLoading = writable(true);

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

export async function initializeStripe() {
  if (!stripePromise) {
    if (env.PUBLIC_STRIPE_PUBLISHABLE_KEY && env.PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_publishable_key_here') {
      stripePromise = loadStripe(env.PUBLIC_STRIPE_PUBLISHABLE_KEY);
    } else {
      console.log('Using mock Stripe mode - no valid publishable key found');
      stripePromise = Promise.resolve(null);
    }
  }
  
  const stripe = await stripePromise;
  stripeStore.set(stripe);
  stripeLoading.set(false);
  
  return stripe;
}

// Payment processing functions
export async function processPayment(
  stripe: Stripe | null,
  clientSecret: string,
  paymentElement: any,
  returnUrl: string
) {
  if (!stripe) {
    // Mock payment processing
    return {
      error: null,
      paymentIntent: {
        id: 'pi_mock_' + Date.now(),
        status: 'succeeded'
      }
    };
  }

  return await stripe.confirmPayment({
    elements: paymentElement,
    confirmParams: {
      return_url: returnUrl,
    },
  });
}

export async function createPaymentElement(stripe: Stripe | null, clientSecret: string) {
  if (!stripe) {
    // Return mock element for development
    return {
      mount: () => {},
      unmount: () => {},
      on: () => {},
      update: () => {}
    };
  }

  const elements = stripe.elements({
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  });

  return elements.create('payment', {
    layout: 'tabs',
  });
} 