<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Category } from '$lib/types';

	let categories: Category[] = [];
	let loading = true;
	let error = '';

	$: projectSlug = $page.params.project;

	onMount(async () => {
		try {
			const response = await fetch('/api/categories');
			
			if (response.ok) {
				const data = await response.json();
				categories = data.categories;
			} else {
				error = 'Failed to load categories';
			}
		} catch (err) {
			console.error('Error loading categories:', err);
			error = 'Failed to connect to server';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Categories - Valle Sagrado</title>
	<meta name="description" content="Browse our product categories and discover unique items from local artisans." />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Page Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h1>
			<p class="text-lg text-gray-600 max-w-2xl mx-auto">
				Explore our curated collection of unique products organized by category. 
				Find exactly what you're looking for from local artisans and vendors.
			</p>
		</div>

		{#if loading}
			<!-- Loading State -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each Array(6) as _}
					<div class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
						<div class="h-48 bg-gray-200 rounded-lg mb-4"></div>
						<div class="h-6 bg-gray-200 rounded mb-2"></div>
						<div class="h-4 bg-gray-200 rounded w-3/4"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="text-center py-12">
				<div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
					<div class="flex justify-center mb-4">
						<svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-red-800 mb-2">Unable to Load Categories</h2>
					<p class="text-red-600 mb-4">{error}</p>
					<button 
						on:click={() => window.location.reload()}
						class="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		{:else if categories.length === 0}
			<!-- Empty State -->
			<div class="text-center py-12">
				<div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
					<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-gray-900 mb-2">No Categories Available</h2>
				<p class="text-gray-600 mb-4">There are currently no categories to display.</p>
				<a 
					href="/{projectSlug}/products" 
					class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
				>
					Browse All Products
				</a>
			</div>
		{:else}
			<!-- Categories Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each categories as category}
					<a 
						href="/{projectSlug}/categories/{category.slug}" 
						class="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
					>
						<!-- Category Image -->
						<div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
							{#if category.image_url}
								<img 
									src={category.image_url} 
									alt={category.name}
									class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
								/>
							{:else}
								<div class="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
									<svg class="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
									</svg>
								</div>
							{/if}
							
							<!-- Overlay -->
							<div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-200"></div>
						</div>

						<!-- Category Info -->
						<div class="p-6">
							<h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
								{category.name}
							</h3>
							
							{#if category.description}
								<p class="text-gray-600 text-sm mb-4 line-clamp-2">
									{category.description}
								</p>
							{/if}

							<!-- Subcategories -->
							{#if category.children && category.children.length > 0}
								<div class="space-y-2">
									<p class="text-xs font-medium text-gray-500 uppercase tracking-wide">
										Subcategories
									</p>
									<div class="flex flex-wrap gap-2">
										{#each category.children.slice(0, 3) as child}
											<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												{child.name}
											</span>
										{/each}
										{#if category.children.length > 3}
											<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
												+{category.children.length - 3} more
											</span>
										{/if}
									</div>
								</div>
							{/if}

							<!-- Call to Action -->
							<div class="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
								Explore Category
								<svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
								</svg>
							</div>
						</div>
					</a>
				{/each}
			</div>

			<!-- Additional Navigation -->
			<div class="mt-12 text-center">
				<div class="bg-white rounded-lg shadow-sm p-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-4">Can't Find What You're Looking For?</h2>
					<p class="text-gray-600 mb-6">
						Browse all our products or use our advanced search and filtering options to find exactly what you need.
					</p>
					<div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
						<a 
							href="/{projectSlug}/products" 
							class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
						>
							Browse All Products
						</a>
						<a 
							href="/{projectSlug}/products?search=" 
							class="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
						>
							Advanced Search
						</a>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style> 