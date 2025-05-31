<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Product } from '$lib/types';
	
	let products: Product[] = [];
	let loading = true;
	let error = '';
	let searchTerm = '';
	let statusFilter = 'all';
	let sortBy = 'name';
	let sortDirection = 'asc';
	
	// Pagination
	let currentPage = 1;
	let totalProducts = 0;
	const productsPerPage = 20;
	
	let filteredProducts: Product[] = [];
	
	onMount(async () => {
		await loadProducts();
	});
	
	$: {
		filteredProducts = filterAndSortProducts(products, searchTerm, statusFilter, sortBy, sortDirection);
	}
	
	async function loadProducts() {
		try {
			loading = true;
			const response = await fetch('/api/admin/products');
			if (response.ok) {
				const data = await response.json();
				products = data.products || [];
				totalProducts = data.total || products.length;
			} else {
				error = 'Failed to load products';
			}
		} catch (err) {
			console.error('Error loading products:', err);
			error = 'Failed to load products';
		} finally {
			loading = false;
		}
	}
	
	function filterAndSortProducts(prods: Product[], search: string, status: string, sort: string, direction: string) {
		let filtered = [...prods];
		
		// Search filter
		if (search.trim()) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(p => 
				p.name.toLowerCase().includes(searchLower) ||
				p.sku.toLowerCase().includes(searchLower) ||
				(p.brand && p.brand.toLowerCase().includes(searchLower))
			);
		}
		
		// Status filter
		if (status !== 'all') {
			filtered = filtered.filter(p => p.status === status);
		}
		
		// Sort
		filtered.sort((a, b) => {
			let aValue: any;
			let bValue: any;
			
			switch (sort) {
				case 'name':
					aValue = a.name;
					bValue = b.name;
					break;
				case 'price':
					aValue = a.price;
					bValue = b.price;
					break;
				case 'stock':
					aValue = a.stock_quantity || 0;
					bValue = b.stock_quantity || 0;
					break;
				case 'created':
					aValue = new Date(a.created_at || '');
					bValue = new Date(b.created_at || '');
					break;
				default:
					return 0;
			}
			
			if (direction === 'desc') {
				return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
			} else {
				return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
			}
		});
		
		return filtered;
	}
	
	async function updateProductStatus(sku: string, newStatus: string) {
		try {
			const response = await fetch(`/api/admin/products/${sku}/status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});
			
			if (response.ok) {
				// Update the product in the local array
				products = products.map(p => 
					p.sku === sku ? { ...p, status: newStatus } : p
				);
			} else {
				alert('Failed to update product status');
			}
		} catch (err) {
			console.error('Error updating status:', err);
			alert('Failed to update product status');
		}
	}
	
	async function deleteProduct(sku: string, name: string) {
		if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
			return;
		}
		
		try {
			const response = await fetch(`/api/admin/products/${sku}`, {
				method: 'DELETE'
			});
			
			if (response.ok) {
				products = products.filter(p => p.sku !== sku);
				totalProducts--;
			} else {
				alert('Failed to delete product');
			}
		} catch (err) {
			console.error('Error deleting product:', err);
			alert('Failed to delete product');
		}
	}
	
	function getStockStatusColor(product: Product): string {
		if (!product.track_inventory) return 'text-gray-500';
		
		const stock = product.stock_quantity || 0;
		if (stock <= 0) return 'text-red-600';
		if (stock <= 10) return 'text-yellow-600';
		return 'text-green-600';
	}
	
	function getStockStatusText(product: Product): string {
		if (!product.track_inventory) return 'Not tracked';
		
		const stock = product.stock_quantity || 0;
		if (stock <= 0) return 'Out of stock';
		if (stock <= 10) return `Low stock (${stock})`;
		return `In stock (${stock})`;
	}
</script>

<svelte:head>
	<title>Manage Products | Admin | Valle Sagrado</title>
</svelte:head>

<main class="container mx-auto px-6 py-12 max-w-7xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Product Management</h1>
			<p class="text-gray-600 mt-2">Manage your product catalog</p>
		</div>
		<a href="/create-product" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
			+ Add New Product
		</a>
	</div>

	<!-- Filters and Search -->
	<div class="bg-white rounded-lg shadow p-6 mb-6">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div>
				<label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
				<input 
					id="search"
					type="text" 
					placeholder="Search products..." 
					bind:value={searchTerm}
					class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
			</div>
			
			<div>
				<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
				<select 
					id="status"
					bind:value={statusFilter}
					class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Status</option>
					<option value="active">Active</option>
					<option value="draft">Draft</option>
					<option value="archived">Archived</option>
				</select>
			</div>
			
			<div>
				<label for="sort" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
				<select 
					id="sort"
					bind:value={sortBy}
					class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="name">Name</option>
					<option value="price">Price</option>
					<option value="stock">Stock</option>
					<option value="created">Created Date</option>
				</select>
			</div>
			
			<div>
				<label for="direction" class="block text-sm font-medium text-gray-700 mb-1">Direction</label>
				<select 
					id="direction"
					bind:value={sortDirection}
					class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="asc">Ascending</option>
					<option value="desc">Descending</option>
				</select>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
			{error}
		</div>
	{:else}
		<!-- Products Table -->
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="px-6 py-3 border-b border-gray-200">
				<h3 class="text-lg font-medium text-gray-900">
					Products ({filteredProducts.length} of {totalProducts})
				</h3>
			</div>
			
			{#if filteredProducts.length === 0}
				<div class="text-center py-12">
					<p class="text-gray-500">No products found</p>
					<a href="/create-product" class="text-blue-600 hover:text-blue-700 mt-2 inline-block">
						Create your first product
					</a>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each filteredProducts as product}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											{#if product.images && product.images.length > 0}
												<img class="h-10 w-10 rounded-lg object-cover mr-3" src={product.images[0]} alt={product.name}>
											{:else}
												<div class="h-10 w-10 rounded-lg bg-gray-200 mr-3 flex items-center justify-center">
													<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
													</svg>
												</div>
											{/if}
											<div>
												<div class="text-sm font-medium text-gray-900">{product.name}</div>
												{#if product.brand}
													<div class="text-sm text-gray-500">{product.brand}</div>
												{/if}
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										${product.price.toFixed(2)} {product.currency}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm {getStockStatusColor(product)}">
										{getStockStatusText(product)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<select 
											value={product.status}
											on:change={(e) => updateProductStatus(product.sku, (e.target as HTMLSelectElement).value)}
											class="text-sm border border-gray-300 rounded px-2 py-1"
										>
											<option value="draft">Draft</option>
											<option value="active">Active</option>
											<option value="archived">Archived</option>
										</select>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
										<button 
											on:click={() => goto(`/admin/products/${product.sku}/edit`)}
											class="text-blue-600 hover:text-blue-900"
										>
											Edit
										</button>
										<button 
											on:click={() => goto(`/products/${product.slug || product.sku}`)}
											class="text-green-600 hover:text-green-900"
										>
											View
										</button>
										<button 
											on:click={() => deleteProduct(product.sku, product.name)}
											class="text-red-600 hover:text-red-900"
										>
											Delete
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</main> 