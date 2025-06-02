<script lang="ts">
	import type { PageData } from './$types';
	import Products from '$components/Products.svelte';
	import { page } from '$app/stores';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	
	const projectSlug = $derived($page.params.project);
</script>

<svelte:head>
	<title>Products - {data.project?.name || 'Valle Sagrado'}</title>
	<meta name="description" content="Browse all products from {data.project?.name || 'Valle Sagrado'}" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Breadcrumbs -->
			<nav class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
				<a href="/" class="hover:text-gray-700">Home</a>
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
				</svg>
				<a href="/{projectSlug}" class="hover:text-gray-700">{data.project?.name}</a>
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
				</svg>
				<span class="text-gray-900">Products</span>
			</nav>

			<!-- Page Title -->
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">All Products</h1>
					<p class="mt-2 text-gray-600">
						Discover our complete collection from {data.project?.name || 'Valle Sagrado'}
					</p>
				</div>
				
				<!-- Quick Links -->
				<div class="hidden md:flex space-x-4">
					<a
						href="/{projectSlug}/categories"
						class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
					>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-4l-3 3.5M5 7l3 3.5M19 7l-3 3.5M5 11l3-3.5" />
						</svg>
						Browse Categories
					</a>
					<a
						href="/{projectSlug}"
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
					>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
						</svg>
						Back to {data.project?.name}
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if data.error}
			<!-- Error State -->
			<div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
				<svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
				<h3 class="mt-2 text-sm font-medium text-red-800">Error Loading Products</h3>
				<p class="mt-1 text-sm text-red-600">{data.error}</p>
				<button
					onclick={() => window.location.reload()}
					class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200"
				>
					Try Again
				</button>
			</div>
		{:else if !data.project}
			<!-- Project Not Found -->
			<div class="text-center py-12">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-4l-3 3.5M5 7l3 3.5M19 7l-3 3.5M5 11l3-3.5" />
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">Project Not Found</h3>
				<p class="mt-1 text-sm text-gray-500">The project you're looking for doesn't exist.</p>
				<a
					href="/"
					class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
				>
					Go Home
				</a>
			</div>
		{:else}
			<!-- Products Component with Full Features -->
			<Products
				products={data.products}
				showFilters={true}
				showSearchBar={true}
				enableQuickFilters={true}
				showPagination={true}
				itemsPerPage={16}
				size="medium"
				priceRange={{ min: 0, max: 10000 }}
			/>
		{/if}
	</div>
</div>

<style>
	/* Custom styles for the products page */
	:global(.products-container) {
		/* Any global styles needed for the products component */
	}
</style> 