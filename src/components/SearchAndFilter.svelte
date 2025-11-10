<script lang="ts">
	import type { Category } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	export let categories: Category[] = [];
	export let currentSearch: string = '';
	export let currentCategory: string = '';
	export let minPrice: string = '';
	export let maxPrice: string = '';
	export let sortBy: string = 'created_at';
	export let sortOrder: string = 'desc';
	export let featuredOnly: boolean = false;
	export let loading: boolean = false;

	const dispatch = createEventDispatcher<{
		search: { filters: FilterState };
		clear: void;
	}>();

	interface FilterState {
		search: string;
		category: string;
		minPrice: string;
		maxPrice: string;
		sortBy: string;
		sortOrder: string;
		featured: boolean;
	}

	let searchInput: string = currentSearch;
	let showAdvancedFilters: boolean = false;

	const sortOptions = [
		{ value: 'created_at', label: 'Newest First', order: 'desc' },
		{ value: 'created_at', label: 'Oldest First', order: 'asc' },
		{ value: 'name', label: 'Name A-Z', order: 'asc' },
		{ value: 'name', label: 'Name Z-A', order: 'desc' },
		{ value: 'price', label: 'Price Low to High', order: 'asc' },
		{ value: 'price', label: 'Price High to Low', order: 'desc' }
	];

	const handleSearch = () => {
		const filters: FilterState = {
			search: searchInput.trim(),
			category: currentCategory,
			minPrice,
			maxPrice,
			sortBy,
			sortOrder,
			featured: featuredOnly
		};
		dispatch('search', { filters });
	};

	const handleClear = () => {
		searchInput = '';
		currentCategory = '';
		minPrice = '';
		maxPrice = '';
		sortBy = 'created_at';
		sortOrder = 'desc';
		featuredOnly = false;
		dispatch('clear');
	};

	const handleSortChange = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		const selectedOption = sortOptions.find(opt => 
			`${opt.value}-${opt.order}` === target.value
		);
		if (selectedOption) {
			sortBy = selectedOption.value;
			sortOrder = selectedOption.order;
			handleSearch();
		}
	};

	// Auto-search on input with debounce
	let searchTimeout: ReturnType<typeof setTimeout>;
	$: {
		if (searchInput !== currentSearch) {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => {
				handleSearch();
			}, 500);
		}
	}
</script>

<div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
	<!-- Search Bar -->
	<div class="flex flex-col sm:flex-row gap-4 mb-4">
		<div class="flex-1 relative">
			<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
			</div>
			<input
				type="text"
				bind:value={searchInput}
				placeholder="Search products..."
				class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				disabled={loading}
			/>
		</div>
		
		<div class="flex gap-2">
			<button
				type="button"
				on:click={() => showAdvancedFilters = !showAdvancedFilters}
				class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
				disabled={loading}
			>
				<span class="flex items-center">
					Filters
					<svg class="ml-2 h-4 w-4 transition-transform {showAdvancedFilters ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</span>
			</button>
			
			<button
				type="button"
				on:click={handleClear}
				class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
				disabled={loading}
			>
				Clear
			</button>
		</div>
	</div>

	<!-- Advanced Filters -->
	{#if showAdvancedFilters}
		<div class="border-t border-gray-200 pt-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Category Filter -->
				<div>
					<label for="category" class="block text-sm font-medium text-gray-700 mb-2">
						Category
					</label>
					<select
						id="category"
						bind:value={currentCategory}
						on:change={handleSearch}
						class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						disabled={loading}
					>
						<option value="">All Categories</option>
						{#each categories as category}
							<option value={category.slug}>{category.name}</option>
							{#if category.children}
								{#each category.children as child}
									<option value={child.slug}>  └ {child.name}</option>
								{/each}
							{/if}
						{/each}
					</select>
				</div>

				<!-- Price Range -->
				<div>
					<label for="min-price" class="block text-sm font-medium text-gray-700 mb-2">
						Min Price
					</label>
					<input
						id="min-price"
						type="number"
						bind:value={minPrice}
						on:change={handleSearch}
						placeholder="0"
						min="0"
						step="0.01"
						class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						disabled={loading}
					/>
				</div>

				<div>
					<label for="max-price" class="block text-sm font-medium text-gray-700 mb-2">
						Max Price
					</label>
					<input
						id="max-price"
						type="number"
						bind:value={maxPrice}
						on:change={handleSearch}
						placeholder="No limit"
						min="0"
						step="0.01"
						class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						disabled={loading}
					/>
				</div>

				<!-- Sort -->
				<div>
					<label for="sort-by" class="block text-sm font-medium text-gray-700 mb-2">
						Sort By
					</label>
					<select
						id="sort-by"
						value="{sortBy}-{sortOrder}"
						on:change={handleSortChange}
						class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						disabled={loading}
					>
						{#each sortOptions as option}
							<option value="{option.value}-{option.order}">{option.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Featured Toggle -->
			<div class="mt-4">
				<label class="flex items-center">
					<input
						type="checkbox"
						bind:checked={featuredOnly}
						on:change={handleSearch}
						class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						disabled={loading}
					/>
					<span class="ml-2 text-sm text-gray-700">Featured products only</span>
				</label>
			</div>
		</div>
	{/if}
</div> 