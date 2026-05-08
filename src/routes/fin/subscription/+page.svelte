<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let submitting = false;
</script>

<svelte:head>
	<title>WordPress Maintenance — Monthly Subscription</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-16">
	<div class="w-full max-w-md">

		<!-- Card -->
		<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

			<!-- Header -->
			<div class="bg-gray-900 dark:bg-gray-950 px-8 py-8 text-white">
				<p class="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">Monthly plan</p>
				<h1 class="text-2xl font-semibold mb-1">WordPress Maintenance</h1>
				<div class="flex items-baseline gap-1 mt-4">
					<span class="text-4xl font-bold">€50</span>
					<span class="text-gray-400">/ month</span>
				</div>
			</div>

			<!-- Included -->
			<div class="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
				<ul class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
					<li class="flex items-center gap-3">
						<span class="ti ti-server text-green-500 text-base"></span>
						Server hosting & maintenance
					</li>
					<li class="flex items-center gap-3">
						<span class="ti ti-eye text-green-500 text-base"></span>
						Monthly system check — everything is running properly
					</li>
					<li class="flex items-center gap-3">
						<span class="ti ti-brand-wordpress text-green-500 text-base"></span>
						WordPress administration & updates
					</li>
					<li class="flex items-center gap-3">
						<span class="ti ti-refresh text-green-500 text-base"></span>
						Recurring billing — cancel anytime
					</li>
				</ul>
			</div>

			<!-- Form -->
			<div class="px-8 py-6">
				{#if form?.error}
					<div class="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
						{form.message}
					</div>
				{/if}

				<form
					method="POST"
					action="?/subscribe"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update();
							submitting = false;
						};
					}}>

					<div class="space-y-4">
						<div>
							<label for="customer_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Name
							</label>
							<input
								id="customer_name"
								name="customer_name"
								type="text"
								required
								placeholder="Your name"
								class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400">
						</div>

						<div>
							<label for="customer_email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Email
							</label>
							<input
								id="customer_email"
								name="customer_email"
								type="email"
								required
								placeholder="you@example.com"
								class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400">
						</div>
					</div>

					<button
						type="submit"
						disabled={submitting}
						class="mt-6 w-full rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium py-2.5 text-sm hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
						{submitting ? 'Redirecting…' : 'Subscribe — €50/month'}
					</button>
				</form>

				<p class="mt-4 text-center text-xs text-gray-400">
					Secure payment via Stripe. Cancel anytime from your billing portal.
				</p>
			</div>
		</div>

	</div>
</div>
