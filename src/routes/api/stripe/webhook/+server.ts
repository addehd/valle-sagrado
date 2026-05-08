import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';

let stripe: Stripe | null = null;

if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY !== 'sk_test_your_secret_key_here') {
	stripe = new Stripe(env.STRIPE_SECRET_KEY, {
		apiVersion: '2025-05-28.basil',
	});
}

const supabase = createClient(
	env.PUBLIC_SUPABASE_URL || '',
	env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const POST: RequestHandler = async ({ request }) => {
	if (!stripe) {
		console.log('Webhook received but Stripe not configured — ignoring');
		return json({ received: true });
	}

	const sig = request.headers.get('stripe-signature');
	const body = await request.text();

	let event: Stripe.Event;

	if (sig && env.STRIPE_WEBHOOK_SECRET) {
		try {
			event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
		} catch (err) {
			console.error('Webhook signature verification failed:', err);
			throw error(400, 'Invalid signature');
		}
	} else {
		// Allow unsigned events in dev when no webhook secret is set
		try {
			event = JSON.parse(body) as Stripe.Event;
		} catch {
			throw error(400, 'Invalid webhook body');
		}
	}

	console.log('Stripe webhook:', event.type);

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;
			if (session.mode === 'subscription') {
				await upsertSubscription({
					stripe_subscription_id: session.subscription as string,
					stripe_customer_id: session.customer as string,
					customer_email: session.customer_email ?? session.customer_details?.email ?? null,
					customer_name: session.metadata?.customer_name ?? null,
					service: session.metadata?.service ?? null,
					status: 'active',
				});
			}
			break;
		}

		case 'customer.subscription.updated': {
			const sub = event.data.object as Stripe.Subscription;
			await upsertSubscription({
				stripe_subscription_id: sub.id,
				stripe_customer_id: sub.customer as string,
				status: mapStripeStatus(sub.status),
				cancel_at_period_end: sub.cancel_at_period_end,
				current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
			});
			break;
		}

		case 'customer.subscription.deleted': {
			const sub = event.data.object as Stripe.Subscription;
			await upsertSubscription({
				stripe_subscription_id: sub.id,
				stripe_customer_id: sub.customer as string,
				status: 'canceled',
			});
			break;
		}

		case 'invoice.payment_succeeded': {
			const invoice = event.data.object as Stripe.Invoice;
			if (invoice.subscription) {
				await upsertSubscription({
					stripe_subscription_id: invoice.subscription as string,
					stripe_customer_id: invoice.customer as string,
					status: 'active',
					last_payment_at: new Date().toISOString(),
				});
			}
			break;
		}

		case 'invoice.payment_failed': {
			const invoice = event.data.object as Stripe.Invoice;
			if (invoice.subscription) {
				await upsertSubscription({
					stripe_subscription_id: invoice.subscription as string,
					stripe_customer_id: invoice.customer as string,
					status: 'past_due',
				});
			}
			break;
		}

		default:
			console.log(`Unhandled Stripe event: ${event.type}`);
	}

	return json({ received: true });
};

function mapStripeStatus(status: Stripe.Subscription.Status): string {
	const map: Record<Stripe.Subscription.Status, string> = {
		active: 'active',
		past_due: 'past_due',
		unpaid: 'past_due',
		canceled: 'canceled',
		incomplete: 'incomplete',
		incomplete_expired: 'canceled',
		trialing: 'active',
		paused: 'paused',
	};
	return map[status] ?? status;
}

async function upsertSubscription(data: Record<string, unknown>) {
	const { error: dbError } = await supabase
		.from('subscriptions')
		.upsert(
			{ ...data, updated_at: new Date().toISOString() },
			{ onConflict: 'stripe_subscription_id' }
		);

	if (dbError) {
		console.error('Failed to upsert subscription:', dbError.message);
	}
}
