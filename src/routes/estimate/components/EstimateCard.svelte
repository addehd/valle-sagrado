<script lang="ts">
	import { enhance } from '$app/forms';
	import PaymentModal from './PaymentModal.svelte';

	export let estimate: any;
	export let isLoggedIn = false;
	export let onEdit: (estimate: any) => void = () => {};
	export let isCompleted = false;
	export let showCost = true; // Show costs by default for backward compatibility

	let showPaymentModal = false;

	// Format currency
	function formatCurrency(amount: number, currency = 'SEK') {
		return new Intl.NumberFormat('sv-SE', {
			style: 'currency',
			currency: currency
		}).format(amount);
	}

	function handleEdit() {
		onEdit(estimate);
	}

	function handlePayment() {
		showPaymentModal = true;
	}
</script>

<div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden transition-colors duration-200 {isCompleted ? 'bg-green-50 dark:bg-neutral-700 border-green-200 dark:border-neutral-600' : ''}">
	<div class="p-6">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">{estimate.title}</h3>
			<div class="flex items-center space-x-2">
				{#if isCompleted}
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-neutral-600 text-green-800 dark:text-neutral-200">
						Completed
					</span>
				{:else if showCost}
					<button
						on:click={handlePayment}
						class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
					>
						💳 Pay Now
					</button>
				{/if}
				
				{#if isLoggedIn}
					<div class="flex space-x-2">
						<button
							on:click={handleEdit}
							class="text-blue-600 dark:text-neutral-300 hover:text-blue-800 dark:hover:text-neutral-200 text-sm font-medium transition-colors duration-200"
						>
							Edit
						</button>
						<form 
							method="POST" 
							action="?/delete" 
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										// Reload the page data after successful deletion
										await update();
									} else if (result.type === 'failure') {
										// Handle error
										console.error('Delete failed:', result.data?.error);
										alert(result.data?.error || 'Failed to delete estimate');
									}
									await update();
								};
							}}
							class="inline"
						>
							<input type="hidden" name="id" value={estimate.id} />
							<button
								type="submit"
								class="text-red-600 dark:text-neutral-400 hover:text-red-800 dark:hover:text-neutral-300 text-sm font-medium hover:bg-red-50 dark:hover:bg-neutral-700 px-2 py-1 rounded transition-colors duration-200"
								on:click={(e) => {
									if (!confirm(`Are you sure you want to delete "${estimate.title}"? This action cannot be undone.`)) {
										e.preventDefault();
									}
								}}
							>
								Delete
							</button>
						</form>
					</div>
				{/if}
			</div>
		</div>

		<div class="space-y-3">
			<div>
				<h4 class="font-medium text-gray-900 dark:text-neutral-100">{estimate.service_name}</h4>
				{#if estimate.description}
					<p class="text-sm text-gray-600 dark:text-neutral-300 mt-1">{estimate.description}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4 text-sm">
				<div class="flex justify-between">
					<span class="text-gray-600 dark:text-neutral-400">Time:</span>
					<span class="font-medium text-gray-900 dark:text-neutral-100">{estimate.estimated_hours}h</span>
				</div>
				{#if showCost}
				<div class="flex justify-between">
					<span class="text-gray-600 dark:text-neutral-400">Rate:</span>
					<span class="font-medium text-gray-900 dark:text-neutral-100">{formatCurrency(parseFloat(estimate.hourly_rate))}/h</span>
				</div>
				{/if}
			</div>

			{#if showCost}
			<div class="border-t border-gray-200 dark:border-neutral-700 pt-3">
				<div class="flex justify-between items-center">
					<span class="text-lg font-semibold text-gray-900 dark:text-neutral-100">
						{isCompleted ? 'Final Cost:' : 'Total Cost:'}
					</span>
					<span class="text-xl font-bold {isCompleted ? 'text-green-600 dark:text-neutral-200' : 'text-blue-600 dark:text-neutral-200'}">
						{formatCurrency(parseFloat(estimate.total_cost))}
					</span>
				</div>
			</div>
			{/if}

			{#if estimate.notes}
				<div class="text-sm text-gray-600 dark:text-neutral-300 border-t border-gray-200 dark:border-neutral-700 pt-3">
					<strong>Important</strong> {estimate.notes}
				</div>
			{/if}

			<div class="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-500 border-t border-gray-200 dark:border-neutral-700 pt-3">
				<span>Status: <span class="capitalize font-medium">{estimate.status}</span></span>
				<span>{new Date(estimate.created_at).toLocaleDateString()}</span>
			</div>
		</div>
	</div>
</div>

<!-- Payment Modal -->
{#if showPaymentModal}
	<PaymentModal
		{estimate}
		on:close={() => (showPaymentModal = false)}
		on:success={() => {
			showPaymentModal = false;
			// You could add a success callback here
		}}
	/>
{/if}