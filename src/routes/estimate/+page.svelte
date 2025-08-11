<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	
	// Component imports
	import MessageBanner from './components/MessageBanner.svelte';
	import AdminPanel from './components/AdminPanel.svelte';
	import AdminTestingCard from './components/AdminTestingCard.svelte';
	import EstimateSection from './components/EstimateSection.svelte';
	import PaymentReadySection from './components/PaymentReadySection.svelte';
	import TotalSummary from './components/TotalSummary.svelte';
	import EmptyState from './components/EmptyState.svelte';
	import PaymentModal from './components/PaymentModal.svelte';

	// Props
	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Constants
	const ESTIMATE_STATUS = {
		DRAFT: 'draft',
		SENT: 'sent',
		APPROVED: 'approved'
	};

	// State management - grouped by purpose using Svelte 5 runes
	let formState = $state({
		show: false,
		editing: null,
		loading: false
	});

	let modalState = $state({
		showPayment: false,
		selectedEstimate: null
	});

	// Utility functions - defined before derived statements
	const formatCurrency = (amount, currency = 'SEK') => {
		return new Intl.NumberFormat('sv-SE', {
			style: 'currency',
			currency: currency
		}).format(amount);
	};

	const calculateTotalValue = (estimates, filter = null) => {
		const filteredEstimates = filter ? estimates.filter(filter) : estimates;
		return filteredEstimates.reduce((sum, e) => sum + parseFloat(e.total_cost), 0);
	};

	// Computed values using Svelte 5 derived runes
	const viewConfig = $derived(data.viewConfig);
	const showCost = $derived(data.showCost);

	const estimatesByStatus = $derived({
		completed: data.estimates.filter(e => e.is_completed),
		approved: data.estimates.filter(e => e.status === ESTIMATE_STATUS.APPROVED && !e.is_completed),
		pending: data.estimates.filter(e => e.status !== ESTIMATE_STATUS.APPROVED && !e.is_completed)
	});

	const totalValues = $derived({
		pending: calculateTotalValue(data.estimates, e => !e.is_completed),
		completed: calculateTotalValue(data.estimates, e => e.is_completed),
		total: calculateTotalValue(data.estimates)
	});

	const showFlags = $derived({
		adminTesting: !data.user && !$page.url.searchParams.has('admin'),
		totalSummary: data.user && data.estimates.length > 0 && showCost,
		hasEstimates: data.estimates.length > 0
	});



	// Event handlers - clean and focused
	const handleEdit = (estimate) => {
		formState.editing = estimate;
		formState.show = true;
	};

	const handleFormCancel = () => {
		formState.editing = null;
		formState.show = false;
	};

	const handleFormSuccess = () => {
		formState.editing = null;
		formState.show = false;
		invalidateAll();
	};

	const handlePayment = (estimate) => {
		modalState.selectedEstimate = estimate;
		modalState.showPayment = true;
	};

	const handleCreateFirst = () => {
		formState.show = true;
	};

	const closePaymentModal = () => {
		modalState.showPayment = false;
		modalState.selectedEstimate = null;
	};

	const handlePaymentSuccess = () => {
		closePaymentModal();
		invalidateAll();
	};

	// Effects using Svelte 5 runes
	$effect(() => {
		if (form?.success) {
			handleFormSuccess();
		}
	});

	// Check URL parameter to show form (from layout button)
	$effect(() => {
		if ($page.url.searchParams.has('showForm') && data.user) {
			formState.show = true;
			// Clean up the URL parameter
			const url = new URL($page.url);
			url.searchParams.delete('showForm');
			window.history.replaceState({}, '', url.toString());
		}
	});
</script>

<svelte:head>
	<title>Service Estimates budgetkweken.nl</title>
	<meta name="description" content="Professional service estimates and pricing" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 transition-colors duration-200">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<!-- Messages -->
		<MessageBanner {form} />

		<!-- Admin Panel -->
		{#if data.user}
			<AdminPanel
				bind:showCreateForm={formState.show}
				bind:editingEstimate={formState.editing}
				bind:loading={formState.loading}
				onformcancel={handleFormCancel}
				onformsuccess={handleFormSuccess} />
		{/if}

		<!-- Main Content -->

		<div class="space-y-8">
			<!-- Pending Estimates -->
			<EstimateSection
				title="Current Service Estimates"
				estimates={estimatesByStatus.pending}
				{viewConfig}
				user={data.user}
				onedit={handleEdit} />

			<!-- Completed Estimates -->
			<EstimateSection
				title="✅ Completed Projects"
				estimates={estimatesByStatus.completed}
				{viewConfig}
				user={data.user}
				isCompleted={true}
				onedit={handleEdit} />

			<!-- Payment Ready Section -->
			<PaymentReadySection
				estimates={estimatesByStatus.approved}
				{viewConfig}
				{formatCurrency}
				onpayment={handlePayment} />

			<!-- Empty State -->
			{#if !showFlags.hasEstimates}
				<EmptyState
					user={data.user}
					oncreateFirst={handleCreateFirst} />
			{/if}
		</div>

		<!-- Total Summary -->
		{#if showFlags.totalSummary}
			<TotalSummary {totalValues} {formatCurrency} />
		{/if}

		<!-- Admin Testing Card -->
		{#if showFlags.adminTesting}
			<AdminTestingCard />
		{/if}

	</div>
</div>

<!-- Payment Modal -->
{#if modalState.showPayment && modalState.selectedEstimate}
	<PaymentModal
		estimate={modalState.selectedEstimate}
		onclose={closePaymentModal}
		onsuccess={handlePaymentSuccess} />
{/if}