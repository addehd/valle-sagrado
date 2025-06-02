<script lang="ts">
	import type { Product } from '$lib/types';
	import ProductCard from './ProductCard.svelte';
	
	interface Props {
		products: Product[];
		maxProducts?: number;
		showFilters?: boolean;
		filterByCategory?: string;
		filterByBrand?: string;
		filterByTags?: string[];
		sortBy?: 'name' | 'price' | 'created_at' | 'featured';
		sortOrder?: 'asc' | 'desc';
		size?: 'small' | 'medium' | 'large';
		showPagination?: boolean;
		itemsPerPage?: number;
		showSearchBar?: boolean;
		enableQuickFilters?: boolean;
		priceRange?: { min?: number; max?: number };
	}

	const {
		products,
		maxProducts = 12,
		showFilters = false,
		filterByCategory,
		filterByBrand,
		filterByTags = [],
		sortBy: initialSortBy = 'created_at',
		sortOrder = 'desc',
		size = 'medium',
		showPagination = false,
		itemsPerPage = 12,
		showSearchBar = false,
		enableQuickFilters = false,
		priceRange
	}: Props = $props();

	// Local state for client-side filtering/searching
	let searchQuery = $state('');
	let selectedCategory = $state(filterByCategory || '');
	let selectedBrand = $state(filterByBrand || '');
	let selectedTags = $state<string[]>([...filterByTags]);
	let minPrice = $state(priceRange?.min || 0);
	let maxPrice = $state(priceRange?.max || 10000);
	let currentPage = $state(1);
	let sortBy = $state(initialSortBy);

	// Get unique values for filter options
	const uniqueCategories = $derived(
		Array.from(new Set(products.map(p => p.categories?.name).filter(Boolean)))
	);
	const uniqueBrands = $derived(
		Array.from(new Set(products.map(p => p.brand).filter(Boolean)))
	);
	const uniqueTags = $derived(
		Array.from(new Set(products.flatMap(p => p.tags || []).filter(Boolean)))
	);

	// Filter and sort products
	const filteredProducts = $derived(() => {
		let filtered = [...products];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(product =>
				product.name.toLowerCase().includes(query) ||
				product.description?.toLowerCase().includes(query) ||
				product.brand?.toLowerCase().includes(query) ||
				product.tags?.some(tag => tag.toLowerCase().includes(query))
			);
		}

		// Apply category filter
		if (selectedCategory) {
			filtered = filtered.filter(product => 
				product.categories?.name === selectedCategory
			);
		}

		// Apply brand filter
		if (selectedBrand) {
			filtered = filtered.filter(product => 
				product.brand === selectedBrand
			);
		}

		// Apply tags filter
		if (selectedTags.length > 0) {
			filtered = filtered.filter(product =>
				product.tags?.some(tag => selectedTags.includes(tag))
			);
		}

		// Apply price range filter
		filtered = filtered.filter(product => {
			const price = product.sale_price || product.price;
			return price >= minPrice && price <= maxPrice;
		});

		// Sort products
		filtered.sort((a, b) => {
			let aValue: any, bValue: any;
			
			switch (sortBy) {
				case 'name':
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
					break;
				case 'price':
					aValue = a.sale_price || a.price;
					bValue = b.sale_price || b.price;
					break;
				case 'featured':
					aValue = a.is_featured ? 1 : 0;
					bValue = b.is_featured ? 1 : 0;
					break;
				case 'created_at':
				default:
					aValue = new Date(a.created_at);
					bValue = new Date(b.created_at);
					break;
			}

			if (sortOrder === 'asc') {
				return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
			} else {
				return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
			}
		});

		return filtered;
	});

	// Apply max products limit and pagination
	const displayedProducts = $derived(() => {
		let displayed = filteredProducts();

		if (showPagination) {
			const startIndex = (currentPage - 1) * itemsPerPage;
			const endIndex = startIndex + itemsPerPage;
			displayed = displayed.slice(startIndex, endIndex);
		} else if (maxProducts) {
			displayed = displayed.slice(0, maxProducts);
		}

		return displayed;
	});

	const totalPages = $derived(
		showPagination ? Math.ceil(filteredProducts().length / itemsPerPage) : 1
	);

	// Reset page when filters change
	const resetPagination = () => {
		currentPage = 1;
	};

	// Clear all filters
	const clearFilters = () => {
		searchQuery = '';
		selectedCategory = filterByCategory || '';
		selectedBrand = filterByBrand || '';
		selectedTags = [...filterByTags];
		minPrice = priceRange?.min || 0;
		maxPrice = priceRange?.max || 10000;
		sortBy = initialSortBy;
		resetPagination();
	};

	// Add/remove tags
	const toggleTag = (tag: string) => {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter(t => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
		resetPagination();
	};
</script>

<div class="products-container">
	<!-- Search Bar -->
	{#if showSearchBar}
		<div class="mb-6">
			<div class="relative">
				<input
					type="text"
					placeholder="Search products..."
					bind:value={searchQuery}
					oninput={resetPagination}
					class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
				<svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
		</div>
	{/if}

	<!-- Filters Section -->
	{#if showFilters}
		<div class="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Filters</h3>
				<button
					onclick={clearFilters}
					class="text-sm text-blue-600 hover:text-blue-800"
				>
					Clear all
				</button>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Category Filter -->
				{#if uniqueCategories.length > 0}
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
						<select
							bind:value={selectedCategory}
							onchange={resetPagination}
							class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">All Categories</option>
							{#each uniqueCategories as category}
								<option value={category}>{category}</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Brand Filter -->
				{#if uniqueBrands.length > 0}
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Brand</label>
						<select
							bind:value={selectedBrand}
							onchange={resetPagination}
							class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">All Brands</option>
							{#each uniqueBrands as brand}
								<option value={brand}>{brand}</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Price Range -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
					<div class="flex space-x-2">
						<input
							type="number"
							placeholder="Min"
							bind:value={minPrice}
							oninput={resetPagination}
							class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<input
							type="number"
							placeholder="Max"
							bind:value={maxPrice}
							oninput={resetPagination}
							class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>

				<!-- Sort Options -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
					<select
						value={sortBy}
						onchange={(e) => {
							const target = e.target as HTMLSelectElement;
							sortBy = target.value as 'name' | 'price' | 'created_at' | 'featured';
							resetPagination();
						}}
						class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="created_at">Newest</option>
						<option value="name">Name</option>
						<option value="price">Price</option>
						<option value="featured">Featured</option>
					</select>
				</div>
			</div>

			<!-- Tags Filter -->
			{#if enableQuickFilters && uniqueTags.length > 0}
				<div class="mt-4">
					<label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
					<div class="flex flex-wrap gap-2">
						{#each uniqueTags.slice(0, 10) as tag}
							<button
								onclick={() => toggleTag(tag)}
								class="px-3 py-1 rounded-full text-sm transition-colors {
									selectedTags.includes(tag)
										? 'bg-blue-600 text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}"
							>
								{tag}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Results Summary -->
	<div class="flex items-center justify-between mb-6">
		<p class="text-gray-600">
			Showing {displayedProducts().length} of {filteredProducts().length} products
		</p>
		
		{#if !showFilters}
			<!-- Simple sort dropdown for when full filters are hidden -->
			<select
				value={sortBy}
				onchange={(e) => {
					const target = e.target as HTMLSelectElement;
					sortBy = target.value as 'name' | 'price' | 'created_at' | 'featured';
				}}
				class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			>
				<option value="created_at">Newest</option>
				<option value="name">Name</option>
				<option value="price">Price</option>
				<option value="featured">Featured</option>
			</select>
		{/if}
	</div>

	<!-- Products Grid -->
	{#if displayedProducts().length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
			{#each displayedProducts() as product (product.id)}
				<ProductCard {product} {size} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-12">
			<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9a2 2 0 012 2v2m0 0h2" />
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
			<p class="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
			{#if showFilters}
				<button
					onclick={clearFilters}
					class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
				>
					Clear filters
				</button>
			{/if}
		</div>
	{/if}

	<!-- Pagination -->
	{#if showPagination && totalPages > 1}
		<div class="flex items-center justify-center space-x-2">
			<button
				onclick={() => currentPage = Math.max(1, currentPage - 1)}
				disabled={currentPage === 1}
				class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Previous
			</button>

			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
				{#if page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)}
					<button
						onclick={() => currentPage = page}
						class="px-3 py-2 border text-sm font-medium rounded-md {
							page === currentPage
								? 'border-blue-500 bg-blue-50 text-blue-600'
								: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
						}"
					>
						{page}
					</button>
				{:else if page === currentPage - 3 || page === currentPage + 3}
					<span class="px-2 py-2 text-gray-500">...</span>
				{/if}
			{/each}

			<button
				onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
				disabled={currentPage === totalPages}
				class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Next
			</button>
		</div>
	{/if}
</div> 