<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import type { Product, Category, ProductsResponse } from '$lib/types';
	import ProductGrid from '$components/ProductGrid.svelte';
	import SearchAndFilter from '$components/SearchAndFilter.svelte';

	let categorySlug = '';
	let projectSlug = '';
	let category: Category | null = null;
	let allCategories: Category[] = [];
	let products: Product[] = [];
	let loading = true;
	let categoryLoading = true;
	let error = '';

	let pagination = {
		page: 1,
		limit: 12,
		total: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPrevPage: false
	};

	// Current filter state - start with category filter
	let currentFilters = {
		search: '',
		category: '',
		minPrice: '',
		maxPrice: '',
		sortBy: 'created_at',
		sortOrder: 'desc',
		featured: false
	};

	onMount(async () => {
		categorySlug = $page.params.slug;
		projectSlug = $page.params.project;
		currentFilters.category = categorySlug;
		
		await Promise.all([
			loadCategoryInfo(),
			loadAllCategories(),
			loadProducts()
		]);
	});

	const loadCategoryInfo = async () => {
		try {
			const response = await fetch('/api/categories');
			
			if (response.ok) {
				const data = await response.json();
				const flatCategories = data.flat || [];
				
				// Find the current category and its hierarchy
				category = flatCategories.find((cat: Category) => cat.slug === categorySlug) || null;
				
				if (!category) {
					error = 'Category not found';
				}
			} else {
				error = 'Failed to load category information';
			}
		} catch (err) {
			console.error('Error loading category:', err);
			error = 'Failed to connect to server';
		} finally {
			categoryLoading = false;
		}
	};

	const loadAllCategories = async () => {
		try {
			const response = await fetch('/api/categories');
			if (response.ok) {
				const data = await response.json();
				allCategories = data.categories;
			}
		} catch (error) {
			console.error('Failed to load categories:', error);
		}
	};

	const loadProducts = async (page = 1) => {
		loading = true;
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: pagination.limit.toString(),
				category: categorySlug, // Always filter by current category
				...(currentFilters.search && { search: currentFilters.search }),
				...(currentFilters.minPrice && { min_price: currentFilters.minPrice }),
				...(currentFilters.maxPrice && { max_price: currentFilters.maxPrice }),
				sort: currentFilters.sortBy,
				order: currentFilters.sortOrder,
				...(currentFilters.featured && { featured: 'true' })
			});

			const response = await fetch(`/api/products?${params}`);
			if (response.ok) {
				const data: ProductsResponse = await response.json();
				products = data.products;
				pagination = data.pagination;
				
				// Update URL without navigation
				if (browser) {
					const url = new URL(window.location.href);
					// Only update search params, preserve the category path
					const newParams = new URLSearchParams();
					if (currentFilters.search) newParams.set('search', currentFilters.search);
					if (currentFilters.minPrice) newParams.set('min_price', currentFilters.minPrice);
					if (currentFilters.maxPrice) newParams.set('max_price', currentFilters.maxPrice);
					if (currentFilters.sortBy !== 'created_at') newParams.set('sort', currentFilters.sortBy);
					if (currentFilters.sortOrder !== 'desc') newParams.set('order', currentFilters.sortOrder);
					if (currentFilters.featured) newParams.set('featured', 'true');
					if (page > 1) newParams.set('page', page.toString());
					
					url.search = newParams.toString();
					window.history.replaceState({}, '', url);
				}
			} else {
				console.error('Failed to load products');
				products = [];
			}
		} catch (error) {
			console.error('Error loading products:', error);
			products = [];
		} finally {
			loading = false;
		}
	};

	const handleSearch = async (event: CustomEvent) => {
		// Keep the category filter but update other filters
		currentFilters = { 
			...event.detail.filters,
			category: categorySlug // Always maintain the current category
		};
		await loadProducts(1);
	};

	const handleClear = async () => {
		currentFilters = {
			search: '',
			category: categorySlug, // Keep the category filter
			minPrice: '',
			maxPrice: '',
			sortBy: 'created_at',
			sortOrder: 'desc',
			featured: false
		};
		await loadProducts(1);
	};

	const handlePageChange = async (newPage: number) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
			await loadProducts(newPage);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	// Generate page numbers for pagination
	$: pageNumbers = (() => {
		const pages = [];
		const total = pagination.totalPages;
		const current = pagination.page;
		
		if (total <= 7) {
			for (let i = 1; i <= total; i++) {
				pages.push(i);
			}
		} else {
			if (current <= 4) {
				for (let i = 1; i <= 5; i++) pages.push(i);
				pages.push('...');
				pages.push(total);
			} else if (current >= total - 3) {
				pages.push(1);
				pages.push('...');
				for (let i = total - 4; i <= total; i++) pages.push(i);
			} else {
				pages.push(1);
				pages.push('...');
				for (let i = current - 1; i <= current + 1; i++) pages.push(i);
				pages.push('...');
				pages.push(total);
			}
		}
		return pages;
	})();

	// Get parent category name if this is a subcategory
	$: parentCategory = category?.parent_id ? 
		allCategories.find(cat => 
			cat.children?.some(child => child.id === category?.id)
		) : null;
</script>

<svelte:head>
	<title>{category ? `${category.name} - Valle Sagrado` : 'Category - Valle Sagrado'}</title>
	<meta name="description" content={category ? `Browse ${category.name} products from local artisans.` : 'Browse category products from local artisans.'} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	{#if categoryLoading}
		<!-- Loading category info -->
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="animate-pulse">
				<div class="h-4 bg-gray-200 rounded w-64 mb-4"></div>
				<div class="h-8 bg-gray-200 rounded w-96 mb-2"></div>
				<div class="h-4 bg-gray-200 rounded w-full mb-8"></div>
			</div>
		</div>
	{:else if error}
		<!-- Error State -->
		<div class="min-h-screen bg-gray-50 flex items-center justify-center">
			<div class="text-center">
				<div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
					<div class="flex justify-center mb-4">
						<svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
						</svg>
					</div>
					<h1 class="text-2xl font-bold text-red-800 mb-2">Category Not Found</h1>
					<p class="text-red-600 mb-4">{error}</p>
					<div class="space-y-2">
						<a 
							href="/{projectSlug}/categories" 
							class="block bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
						>
							Browse All Categories
						</a>
						<a 
							href="/{projectSlug}/product" 
							class="block bg-gray-200 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
						>
							View All Products
						</a>
					</div>
				</div>
			</div>
		</div>
	{:else if category}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Breadcrumbs -->
			<nav class="mb-8" aria-label="Breadcrumb">
				<ol class="flex items-center space-x-2 text-sm text-gray-600">
					<li><a href="/{projectSlug}" class="hover:text-gray-900">Home</a></li>
					<li class="flex items-center">
						<svg class="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
						</svg>
						<a href="/{projectSlug}/categories" class="hover:text-gray-900">Categories</a>
					</li>
					{#if parentCategory}
						<li class="flex items-center">
							<svg class="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
							</svg>
							<a href="/{projectSlug}/categories/{parentCategory.slug}" class="hover:text-gray-900">{parentCategory.name}</a>
						</li>
					{/if}
					<li class="flex items-center">
						<svg class="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
						</svg>
						<span class="text-gray-900">{category.name}</span>
					</li>
				</ol>
			</nav>

			<!-- Category Header -->
			<div class="mb-8">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<h1 class="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
						{#if category.description}
							<p class="text-lg text-gray-600 mb-4">{category.description}</p>
						{/if}
					</div>
					
					{#if category.image_url}
						<div class="hidden md:block ml-8">
							<img 
								src={category.image_url} 
								alt={category.name}
								class="w-32 h-32 object-cover rounded-lg shadow-sm"
							/>
						</div>
					{/if}
				</div>
			</div>

			<!-- Search and Filters -->
			<SearchAndFilter
				categories={allCategories}
				currentSearch={currentFilters.search}
				currentCategory={currentFilters.category}
				minPrice={currentFilters.minPrice}
				maxPrice={currentFilters.maxPrice}
				sortBy={currentFilters.sortBy}
				sortOrder={currentFilters.sortOrder}
				featuredOnly={currentFilters.featured}
				{loading}
				on:search={handleSearch}
				on:clear={handleClear}
			/>

			<!-- Results Summary -->
			{#if !loading && products.length > 0}
				<div class="mb-6 text-sm text-gray-600">
					Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products in {category.name}
				</div>
			{/if}

			<!-- Product Grid -->
			<ProductGrid {products} {loading} columns={4} />

			<!-- Empty State -->
			{#if !loading && products.length === 0}
				<div class="text-center py-12">
					<div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
						<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
						</svg>
					</div>
					<h2 class="text-2xl font-bold text-gray-900 mb-2">No Products Found</h2>
					<p class="text-gray-600 mb-4">
						{currentFilters.search || currentFilters.minPrice || currentFilters.maxPrice ? 
							'Try adjusting your filters to see more products.' : 
							`There are currently no products available in the ${category.name} category.`}
					</p>
					<div class="space-y-2 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
						{#if currentFilters.search || currentFilters.minPrice || currentFilters.maxPrice}
							<button 
								on:click={handleClear}
								class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
							>
								Clear Filters
							</button>
						{/if}
						<a 
							href="/{projectSlug}/categories" 
							class="bg-gray-200 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
						>
							Browse Other Categories
						</a>
					</div>
				</div>
			{/if}

			<!-- Pagination -->
			{#if pagination.totalPages > 1}
				<div class="mt-12 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
					<div class="flex flex-1 justify-between sm:hidden">
						<button
							on:click={() => handlePageChange(pagination.page - 1)}
							disabled={!pagination.hasPrevPage || loading}
							class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<button
							on:click={() => handlePageChange(pagination.page + 1)}
							disabled={!pagination.hasNextPage || loading}
							class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>

					<div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
						<div>
							<p class="text-sm text-gray-700">
								Showing page <span class="font-medium">{pagination.page}</span> of <span class="font-medium">{pagination.totalPages}</span>
							</p>
						</div>
						<div>
							<nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
								<!-- Previous Button -->
								<button
									on:click={() => handlePageChange(pagination.page - 1)}
									disabled={!pagination.hasPrevPage || loading}
									class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<span class="sr-only">Previous</span>
									<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
									</svg>
								</button>

								<!-- Page Numbers -->
								{#each pageNumbers as pageNum}
									{#if pageNum === '...'}
										<span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>
									{:else}
										<button
											on:click={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
											disabled={loading}
											class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed
												{pageNum === pagination.page ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' : 'text-gray-900'}"
										>
											{pageNum}
										</button>
									{/if}
								{/each}

								<!-- Next Button -->
								<button
									on:click={() => handlePageChange(pagination.page + 1)}
									disabled={!pagination.hasNextPage || loading}
									class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<span class="sr-only">Next</span>
									<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
									</svg>
								</button>
							</nav>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div> 