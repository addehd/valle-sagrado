<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let estimate: any;
	
	const dispatch = createEventDispatcher();
	
	let loading = false;
	let error = '';
	
	function formatCurrency(amount: number, currency = 'SEK') {
		return new Intl.NumberFormat('sv-SE', {
			style: 'currency',
			currency: currency
		}).format(amount);
	}
	
	function handleClose() {
		dispatch('close');
	}
	
	async function handlePayment() {
		loading = true;
		error = '';
		
		try {
			// For now, this is a mock payment flow
			// In a real implementation, you would integrate with Stripe or another payment processor
			await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
			
			dispatch('success');
			alert('Payment processed successfully! (This is a demo)');
		} catch (err) {
			error = 'Payment failed. Please try again.';
		} finally {
			loading = false;
		}
	}
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}
</script>

<!-- Modal backdrop -->
<div 
	class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
	on:click={handleBackdropClick}
	on:keydown={(e) => e.key === 'Escape' && handleClose()}
	role="dialog"
	tabindex="-1"
	aria-modal="true"
	aria-labelledby="payment-modal-title"
>
	<!-- Modal content -->
	<div class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
		<!-- Header -->
		<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
			<h2 id="payment-modal-title" class="text-xl font-semibold text-gray-900 dark:text-neutral-100">
				Payment Details
			</h2>
			<button
				on:click={handleClose}
				class="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors"
				aria-label="Close modal"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
		
		<!-- Content -->
		<div class="p-6">
			<!-- Service details -->
			<div class="mb-6">
				<h3 class="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">
					{estimate.title}
				</h3>
				<p class="text-sm text-gray-600 dark:text-neutral-400 mb-4">
					{estimate.service_name}
				</p>
				
				{#if estimate.description}
					<p class="text-sm text-gray-600 dark:text-neutral-400 mb-4">
						{estimate.description}
					</p>
				{/if}
				
				<!-- Cost breakdown -->
				<div class="bg-gray-50 dark:bg-neutral-700 p-4 rounded-lg space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-gray-600 dark:text-neutral-400">Estimated Hours:</span>
						<span class="text-gray-900 dark:text-neutral-100">{estimate.estimated_hours}h</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-gray-600 dark:text-neutral-400">Hourly Rate:</span>
						<span class="text-gray-900 dark:text-neutral-100">{formatCurrency(parseFloat(estimate.hourly_rate))}/h</span>
					</div>
					<div class="border-t border-gray-200 dark:border-neutral-600 pt-2">
						<div class="flex justify-between font-semibold">
							<span class="text-gray-900 dark:text-neutral-100">Total:</span>
							<span class="text-blue-600 dark:text-neutral-200">{formatCurrency(parseFloat(estimate.total_cost))}</span>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Payment form placeholder -->
			<div class="mb-6">
				<h4 class="text-md font-medium text-gray-900 dark:text-neutral-100 mb-4">
					Payment Information
				</h4>
				
				<div class="space-y-4">
					<div>
						<label for="card-number" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
							Card Number
						</label>
						<input
							type="text"
							id="card-number"
							placeholder="1234 5678 9012 3456"
							class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-neutral-100"
							disabled={loading}
						/>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="expiry" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
								Expiry
							</label>
							<input
								type="text"
								id="expiry"
								placeholder="MM/YY"
								class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-neutral-100"
								disabled={loading}
							/>
						</div>
						<div>
							<label for="cvc" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
								CVC
							</label>
							<input
								type="text"
								id="cvc"
								placeholder="123"
								class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-neutral-100"
								disabled={loading}
							/>
						</div>
					</div>
				</div>
			</div>
			
			{#if error}
				<div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
					<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			{/if}
			
			<!-- Demo notice -->
			<div class="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
				<p class="text-sm text-yellow-600 dark:text-yellow-400">
					<strong>Demo Mode:</strong> This is a demonstration. No actual payment will be processed.
				</p>
			</div>
		</div>
		
		<!-- Footer -->
		<div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-neutral-700">
			<button
				on:click={handleClose}
				class="px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
				disabled={loading}
			>
				Cancel
			</button>
			<button
				on:click={handlePayment}
				class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
				disabled={loading}
			>
				{loading ? 'Processing...' : `Pay ${formatCurrency(parseFloat(estimate.total_cost))}`}
			</button>
		</div>
	</div>
</div>