<script>
	import { page } from '$app/stores';
	
	let { children, data } = $props();
	
	// Check if user is logged in for showing admin buttons
	const isLoggedIn = $derived(!!data?.user);
	
	// Handle button actions
	function handleTestStripe() {
		// Navigate to current page with admin=true parameter
		const url = new URL($page.url);
		url.searchParams.set('admin', 'true');
		url.searchParams.set('cost', 'show');
		window.location.href = url.toString();
	}
	
	function handleNewEstimate() {
		// Navigate to current page with a parameter to trigger form
		const url = new URL($page.url);
		url.searchParams.set('showForm', 'true');
		window.location.href = url.toString();
	}
</script>

<!-- Main content -->
<div class="pb-20">
	{@render children()}
</div>

<!-- Fixed bottom action bar -->
<div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 shadow-lg z-50 transition-colors duration-200">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between py-3">
			
			<!-- Left side - Test Stripe button -->
			<button
				onclick={handleTestStripe}
				class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors duration-200">
				<span class="mr-2">🔧</span>
				Test Stripe
			</button>

			<!-- Right side - Add New Estimate button (only for logged in users) -->
			{#if isLoggedIn}
				<button
					onclick={handleNewEstimate}
					class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg transition-colors duration-200 shadow-sm">
					<span class="mr-2">➕</span>
					Add New Estimate
				</button>
			{:else}
				<!-- Placeholder to maintain layout balance -->
				<div class="w-32"></div>
			{/if}
		</div>
	</div>
</div>