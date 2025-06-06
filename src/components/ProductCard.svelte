<script lang="ts">
	import type { Product } from '$lib/types';
	import { goto } from '$app/navigation';
	import { cartStore } from '$lib/stores/cart';
	import { getStockInfo, isProductAvailable, getStockBadgeClasses } from '$lib/stock';
	import { getPrimaryImageUrl, getOptimizedImageUrl, generateImageSrcSet, generateImageSizes } from '$lib/image';

	export let product: Product;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let projectSlug: string | undefined = undefined;

	let addingToCart = false;

	// Use stock management utilities
	$: stockInfo = getStockInfo(product);
	$: isAvailable = isProductAvailable(product);

	const formatPrice = (price: number, currency: string = 'USD') => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency
		}).format(price);
	};

	const handleClick = () => {
		// Use the product's slug if available, otherwise generate one from the name
		const slug = product.slug || createSlug(product.name);
		
		// If we have a project slug, include it in the URL structure
		if (projectSlug) {
			goto(`/${projectSlug}/product/${slug}`);
		} else {
			// Fallback to the old URL structure if no project context
			goto(`/product/${slug}`);
		}
	};

	// Helper function to create slug from product name
	const createSlug = (name: string) => {
		return name
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	};

	const handleAddToCart = async () => {
		if (!isAvailable || addingToCart) return;
		
		addingToCart = true;
		try {
			const success = await cartStore.addItem(product.sku, 1);
			// Success is handled automatically by the cart store
		} catch (error) {
			console.error('Failed to add to cart:', error);
		} finally {
			addingToCart = false;
		}
	};

	const sizeClasses = {
		small: 'max-w-xs',
		medium: 'max-w-sm',
		large: 'max-w-md'
	};

	// Get optimized image based on card size
	const getOptimizedImageForSize = (size: 'small' | 'medium' | 'large') => {
		const sizeMap = {
			small: { width: 300, height: 300 },
			medium: { width: 400, height: 400 },
			large: { width: 600, height: 600 }
		};
		return getPrimaryImageUrl(product.images, sizeMap[size]);
	};
</script>

<div
	class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer {sizeClasses[size]} overflow-hidden border border-gray-100 w-full"
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<article class="w-full">
		<!-- Product Image -->
		<div class="relative aspect-square overflow-hidden bg-gray-100">
			<img
				src={getOptimizedImageForSize(size)}
				srcset={generateImageSrcSet(getPrimaryImageUrl(product.images))}
				sizes={generateImageSizes()}
				alt={product.name}
				class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
				loading="lazy"
			/>
			
			<!-- Featured Badge -->
			{#if product.is_featured}
				<div class="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
					Featured
				</div>
			{/if}

			<!-- Stock Status Badge -->
			{#if stockInfo.status !== 'in_stock'}
				<div class="absolute top-2 right-2 {getStockBadgeClasses(stockInfo)}">
					{stockInfo.message}
				</div>
			{/if}
		</div>

		<!-- Product Info -->
		<div class="p-4">
			<!-- Category -->
			{#if product.categories}
				<p class="text-xs text-gray-500 uppercase tracking-wide mb-1">
					{product.categories.name}
				</p>
			{/if}

			<!-- Product Name -->
			<h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
				{product.name}
			</h3>

			<!-- Short Description -->
			{#if product.short_description}
				<p class="text-sm text-gray-600 mb-3 line-clamp-2">
					{product.short_description}
				</p>
			{/if}

			<!-- Price -->
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<!-- Show sale price if available -->
					{#if product.sale_price && product.sale_price < product.price}
						<span class="text-lg font-bold text-red-600">
							{formatPrice(product.sale_price, product.currency)}
						</span>
						<span class="text-sm text-gray-500 line-through">
							{formatPrice(product.price, product.currency)}
						</span>
					{:else}
						<span class="text-lg font-bold text-gray-900">
							{formatPrice(product.price, product.currency)}
						</span>
						{#if product.compare_at_price && product.compare_at_price > product.price}
							<span class="text-sm text-gray-500 line-through">
								{formatPrice(product.compare_at_price, product.currency)}
							</span>
						{/if}
					{/if}
				</div>

				<!-- Tags -->
				{#if product.tags && product.tags.length > 0}
					<div class="flex flex-wrap gap-1">
						{#each product.tags.slice(0, 2) as tag}
							<span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
								{tag}
							</span>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Stock Info (if low stock or special status) -->
			{#if stockInfo.status === 'low_stock'}
				<div class="mt-2 text-sm {stockInfo.color === 'red' ? 'text-red-600' : 'text-yellow-600'}">
					⚠️ {stockInfo.message}
				</div>
			{:else if stockInfo.status === 'backorder_allowed'}
				<div class="mt-2 text-sm text-blue-600">
					ℹ️ {stockInfo.message}
				</div>
			{/if}

			<!-- Add to Cart Button -->
			<button
				type="button"
				class="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
				disabled={!isAvailable || addingToCart}
				onclick={(e) => {
					e.stopPropagation();
					handleAddToCart();
				}}
			>
				{#if addingToCart}
					<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Adding...
				{:else if !isAvailable}
					{stockInfo.status === 'out_of_stock' ? 'Out of Stock' : 'Unavailable'}
				{:else}
					Add to Cart
				{/if}
			</button>
		</div>
	</article>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.aspect-square {
		aspect-ratio: 1 / 1;
	}
</style> 