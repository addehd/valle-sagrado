<script lang="ts">
	import type { Product } from '$lib/types';
	import ProductCard from './ProductCard.svelte';

	export let products: Product[] = [];
	export let loading: boolean = false;
	export let columns: number = 4;

	const gridCols: Record<number, string> = {
		1: 'grid-cols-1',
		2: 'grid-cols-1 sm:grid-cols-2',
		3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
		4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
		5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
		6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
	};
</script>

<div class="w-full">
	{#if loading}
		<!-- Loading skeleton -->
		<div class="grid {gridCols[columns] || gridCols[4]} gap-6">
			{#each Array(8) as _}
				<div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 animate-pulse">
					<div class="aspect-square bg-gray-200"></div>
					<div class="p-4">
						<div class="h-4 bg-gray-200 rounded mb-2"></div>
						<div class="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
						<div class="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
						<div class="h-10 bg-gray-200 rounded"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if products.length === 0}
		<!-- Empty state -->
		<div class="text-center py-12">
			<div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
				<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
			<p class="text-gray-600">Try adjusting your search or filter criteria.</p>
		</div>
	{:else}
		<!-- Products grid -->
		<div class="grid {gridCols[columns] || gridCols[4]} gap-6">
			{#each products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.aspect-square {
		aspect-ratio: 1 / 1;
	}
</style> 