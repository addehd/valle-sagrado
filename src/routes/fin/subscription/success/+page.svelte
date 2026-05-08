<svelte:head>
	<title>Subscription confirmed</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
	<div class="w-full max-w-md text-center">

		<div class="mb-6 flex justify-center">
			<div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
				<span class="ti ti-check text-green-600 dark:text-green-400 text-2xl"></span>
			</div>
		</div>

		<h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">You're all set!</h1>
		<p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
			Your WordPress maintenance subscription is active. You'll receive a confirmation email from Stripe
			with your invoice and a link to manage your billing.
		</p>

		<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-5 text-left space-y-3 mb-8">
			<div class="flex justify-between text-sm">
				<span class="text-gray-500 dark:text-gray-400">Plan</span>
				<span class="text-gray-900 dark:text-white font-medium">WordPress Maintenance</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-gray-500 dark:text-gray-400">Amount</span>
				<span class="text-gray-900 dark:text-white font-medium">€50 / month</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-gray-500 dark:text-gray-400">Billing</span>
				<span class="text-gray-900 dark:text-white font-medium">Recurring — cancel anytime</span>
			</div>
		</div>

		<a
			href="/fin"
			class="inline-block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
			← Back to fin
		</a>

	</div>
</div>
