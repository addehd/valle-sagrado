<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import { onMount } from 'svelte';
	import EstimateCard from './components/EstimateCard.svelte';
	import EstimateForm from './components/EstimateForm.svelte';

	export let data: PageData;
	export let form: ActionData;

	let showCreateForm = false;
	let editingEstimate: any = null;
	let loading = false;

	// Check if costs should be shown based on URL parameter OR if user is logged in
	$: showCost = $page.url.searchParams.get('cost') === 'show' || !!data.user;

	// Format currency
	function formatCurrency(amount: number, currency = 'SEK') {
		return new Intl.NumberFormat('sv-SE', {
			style: 'currency',
			currency: currency
		}).format(amount);
	}

	// Group estimates by completion status
	$: completedEstimates = data.estimates.filter(e => e.is_completed);
	$: pendingEstimates = data.estimates.filter(e => !e.is_completed);

	function handleEdit(estimate: any) {
		editingEstimate = estimate;
		showCreateForm = true;
	}

	function handleFormCancel() {
		editingEstimate = null;
		showCreateForm = false;
	}

	function handleFormSuccess() {
		editingEstimate = null;
		showCreateForm = false;
		invalidateAll();
	}

	onMount(() => {
		// Handle form responses
		if (form?.success) {
			handleFormSuccess();
		}
	});
</script>

<svelte:head>
	<title>Service Estimates budgetkweken.nl</title>
	<meta name="description" content="Professional service estimates and pricing" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 transition-colors duration-200">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<!-- <div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-neutral-100 mb-2">Service Estimates</h1>
			<p class="text-gray-600 dark:text-neutral-400">Professional service estimates with detailed pricing breakdown</p>
			
			{#if !data.user && showCost}
				<div class="mt-4 p-4 bg-blue-50 dark:bg-neutral-700 border border-blue-200 dark:border-neutral-600 rounded-lg">
					<p class="text-blue-800 dark:text-neutral-300">
						💳 <strong>Ready to get started?</strong> Click "Pay Now" on any service to proceed with secure payment via Stripe.
					</p>
				</div>
			{:else if !data.user && !showCost}
				<div class="mt-4 p-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg">
					<p class="text-gray-700 dark:text-neutral-400">
						📋 <strong>Service Portfolio</strong> - Add <code class="bg-gray-100 dark:bg-neutral-700 px-1 rounded">?cost=show</code> to the URL to view pricing details.
					</p>
				</div>
			{/if}
		</div> -->

		<!-- Error/Success Messages -->
		{#if form?.error}
			<div class="mb-6 p-4 bg-red-50 dark:bg-neutral-700 border border-red-200 dark:border-neutral-600 rounded-lg">
				<p class="text-red-700 dark:text-neutral-300">{form.error}</p>
			</div>
		{/if}

		{#if form?.success}
			<div class="mb-6 p-4 bg-green-50 dark:bg-neutral-700 border border-green-200 dark:border-neutral-600 rounded-lg">
				<p class="text-green-700 dark:text-neutral-300">
					{form.message || (editingEstimate ? 'Estimate updated successfully!' : 'Estimate created successfully!')}
				</p>
			</div>
		{/if}

		<!-- Admin Panel (only visible when logged in) -->
		{#if data.user}
			<div class="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-neutral-100">Manage Estimates</h2>
					<div class="flex space-x-3">
						<a
							href="/api/stripe/test"
							target="_blank"
							class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-neutral-600 text-sm font-medium rounded-md text-gray-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
						>
							🔧 Test Stripe
						</a>
						<button
							on:click={() => (showCreateForm = !showCreateForm)}
							class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
						>
							{showCreateForm ? 'Cancel' : 'Add New Estimate'}
						</button>
					</div>
				</div>

				<!-- Create/Edit Form -->
				{#if showCreateForm}
					<EstimateForm
						{editingEstimate}
						{loading}
						on:cancel={handleFormCancel}
						on:success={handleFormSuccess}
					/>
				{/if}
			</div>
		{/if}

		<!-- Public Estimates Display -->
		<div class="space-y-8">
			<!-- Pending Estimates -->
			{#if pendingEstimates.length > 0}
				<div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-6">Current Service Estimates</h2>
					<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each pendingEstimates as estimate}
							<EstimateCard
								{estimate}
								isLoggedIn={!!data.user}
								onEdit={handleEdit}
								isCompleted={false}
								{showCost}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Completed Estimates -->
			{#if completedEstimates.length > 0}
				<div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-6">✅ Completed Projects</h2>
					<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each completedEstimates as estimate}
							<EstimateCard
								{estimate}
								isLoggedIn={!!data.user}
								onEdit={handleEdit}
								isCompleted={true}
								{showCost}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Empty State -->
			{#if data.estimates.length === 0}
				<div class="text-center py-12">
					<div class="text-gray-500 dark:text-neutral-500 text-lg">No estimates available yet.</div>
					{#if data.user}
						<button
							on:click={() => (showCreateForm = true)}
							class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
						>
							Create Your First Estimate
						</button>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Total Summary (only for logged in users AND when cost=show) -->
		{#if data.user && data.estimates.length > 0 && showCost}
			<div class="mt-12 p-6 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
				<!-- Background image with blur -->
				<div class="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm">
				</div>
				<!-- Dark overlay for better text readability -->
				<div class="absolute inset-0 bg-black/30 dark:bg-black/60"></div>
				<!-- Content wrapper -->
				<div class="relative z-10 text-white">
					<h3 class="text-xl font-semibold mb-4">💰 Total Project Value Summary</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div class="text-center">
							<div class="text-2xl font-bold text-blue-400">
								{formatCurrency(
									data.estimates
										.filter(e => !e.is_completed)
										.reduce((sum, e) => sum + parseFloat(e.total_cost), 0)
								)}
							</div>
							<div class="text-gray-300">Pending Estimates</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-green-400">
								{formatCurrency(
									data.estimates
										.filter(e => e.is_completed)
										.reduce((sum, e) => sum + parseFloat(e.total_cost), 0)
								)}
							</div>
							<div class="text-gray-300">Completed Projects</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-yellow-400">
								{formatCurrency(data.estimates.reduce((sum, e) => sum + parseFloat(e.total_cost), 0))}
							</div>
							<div class="text-gray-300">Total Value</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Stripe Integration Info -->
		<!-- <div class="mt-8 p-4 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-center transition-colors duration-200">
			<p class="text-gray-600 dark:text-neutral-400 text-sm">
				🔒 Payments are processed securely via <strong>Stripe</strong> with industry-standard encryption.
				{#if !data.user}
					All major credit cards accepted.
				{/if}
			</p>
		</div> -->
	</div>
</div>