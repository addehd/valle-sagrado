import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

// Initialize Stripe
let stripe: Stripe | null = null;
let isMockMode = false;

if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY !== 'sk_test_your_secret_key_here') {
	stripe = new Stripe(env.STRIPE_SECRET_KEY, {
		apiVersion: '2025-05-28.basil',
	});
} else {
	console.log('Using mock Stripe mode - no valid STRIPE_SECRET_KEY found');
	isMockMode = true;
}

export const actions = {
	createCheckout: async ({ request, url }) => {
		try {
			const formData = await request.formData();
			
			const packageId = formData.get('package_id') as string;
			const customerName = formData.get('customer_name') as string;
			const customerEmail = formData.get('customer_email') as string;
			const customerPhone = formData.get('customer_phone') as string;
			const customerMessage = formData.get('customer_message') as string;
			const packageTitle = formData.get('package_title') as string;
			const packagePrice = formData.get('package_price') as string;
			const isSubscription = formData.get('is_subscription') === 'true';

			// Validate required fields
			if (!packageId || !customerName || !customerEmail || !customerPhone) {
				return fail(400, { error: true, message: 'Alla obligatoriska fält måste fyllas i' });
			}

			// Mock mode for development
			if (isMockMode) {
				console.log('Mock checkout created:', {
					packageId,
					customerName,
					customerEmail,
					customerPhone,
					packageTitle,
					packagePrice
				});
				
				// In mock mode, redirect to a success page with mock data
				throw redirect(303, `/danny/booking-success?mock=true&package=${encodeURIComponent(packageTitle)}`);
			}

			// Real Stripe integration
			if (!stripe) {
				return fail(500, { error: true, message: 'Stripe är inte konfigurerat' });
			}

			const origin = url.origin;

			// Create Stripe Checkout Session
			const session = await stripe.checkout.sessions.create({
				mode: isSubscription ? 'subscription' : 'payment',
				payment_method_types: ['card'],
				customer_email: customerEmail,
				line_items: [
					{
						price_data: {
							currency: 'sek',
							product_data: {
								name: packageTitle,
								description: `Personlig träning med Danny - ${packageTitle}`,
							},
							unit_amount: Math.round(parseFloat(packagePrice.replace(/[^\d]/g, '')) * 100), // Convert SEK to öre
							...(isSubscription && {
								recurring: {
									interval: 'month',
								},
							}),
						},
						quantity: 1,
					},
				],
				metadata: {
					package_id: packageId,
					customer_name: customerName,
					customer_phone: customerPhone,
					customer_message: customerMessage || '',
					service: 'danny_training',
				},
				success_url: `${origin}/danny/booking-success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${origin}/danny/paket`,
			});

			// Redirect to Stripe Checkout
			throw redirect(303, session.url!);

		} catch (error) {
			// If it's a redirect, throw it
			if (error instanceof Response && error.status === 303) {
				throw error;
			}
			
			console.error('Error creating checkout session:', error);
			return fail(500, { 
				error: true, 
				message: 'Något gick fel. Försök igen eller kontakta Danny direkt.' 
			});
		}
	}
} satisfies Actions;
