import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

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
	subscribe: async ({ request, url }) => {
		try {
			const formData = await request.formData();
			const customerName = formData.get('customer_name') as string;
			const customerEmail = formData.get('customer_email') as string;

			if (!customerName || !customerEmail) {
				return fail(400, { error: true, message: 'Name and email are required.' });
			}

			if (isMockMode) {
				throw redirect(303, '/fin/subscription/success?mock=true');
			}

			if (!stripe) {
				return fail(500, { error: true, message: 'Payment system not configured.' });
			}

			const session = await stripe.checkout.sessions.create({
				mode: 'subscription',
				payment_method_types: ['card'],
				customer_email: customerEmail,
				line_items: [
					{
						price_data: {
							currency: 'eur',
							product_data: {
								name: 'WordPress Maintenance — Monthly',
								description:
									'Server hosting, system monitoring, and WordPress administration.',
							},
							unit_amount: 5000, // €50.00 in cents
							recurring: {
								interval: 'month',
							},
						},
						quantity: 1,
					},
				],
				metadata: {
					customer_name: customerName,
					service: 'wordpress_maintenance',
				},
				success_url: `${url.origin}/fin/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${url.origin}/fin/subscription`,
			});

			throw redirect(303, session.url!);
		} catch (err) {
			if (err instanceof Response) throw err;
			console.error('Subscription checkout error:', err);
			return fail(500, { error: true, message: 'Something went wrong. Please try again.' });
		}
	}
} satisfies Actions;
