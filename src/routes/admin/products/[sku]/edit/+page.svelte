<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Product } from '$lib/types';
	
	export let data: { product?: Product } = {};
	
	let sku = '';
	let slug = '';
	let name = '';
	let brand = '';
	let description = '';
	let price = '';
	let sale_price = '';
	let sale_start = '';
	let sale_end = '';
	let currency = 'USD';
	let stock = 0;
	let status = 'draft';
	let weight_grams = '';
	let dimensions_cm = '';
	let images: File[] = [];
	let existingImages: string[] = [];
	let categories = '';
	let attributes = '';
	let track_inventory = true;
	let allow_backorders = false;

	let error = '';
	let success = '';
	let loading = false;

	$: productSku = $page.params.sku;

	onMount(async () => {
		if (data?.product) {
			loadProductData(data.product);
		} else {
			await loadProduct();
		}
	});

	function loadProductData(product: Product) {
		sku = product.sku;
		slug = product.slug || '';
		name = product.name;
		brand = product.brand || '';
		description = product.description || '';
		price = product.price.toString();
		sale_price = product.sale_price?.toString() || '';
		sale_start = product.sale_start || '';
		sale_end = product.sale_end || '';
		currency = product.currency || 'USD';
		stock = product.stock_quantity || 0;
		status = product.status || 'draft';
		weight_grams = product.weight_grams?.toString() || '';
		dimensions_cm = product.dimensions_cm ? JSON.stringify(product.dimensions_cm) : '';
		existingImages = product.images || [];
		categories = product.categories ? JSON.stringify(product.categories) : '';
		attributes = product.attributes ? JSON.stringify(product.attributes) : '';
		track_inventory = product.track_inventory !== false;
		allow_backorders = product.allow_backorders === true;
	}

	async function loadProduct() {
		try {
			loading = true;
			const response = await fetch(`/api/admin/products/${productSku}`);
			if (response.ok) {
				const product = await response.json();
				loadProductData(product);
			} else {
				error = 'Product not found';
			}
		} catch (err) {
			console.error('Error loading product:', err);
			error = 'Failed to load product';
		} finally {
			loading = false;
		}
	}

	function handleImages(event: Event) {
		images = Array.from((event.target as HTMLInputElement).files || []);
	}

	function removeExistingImage(index: number) {
		existingImages = existingImages.filter((_, i) => i !== index);
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';
		success = '';
		loading = true;

		try {
			const formData = new FormData();
			formData.append('sku', sku);
			formData.append('slug', slug);
			formData.append('name', name);
			formData.append('brand', brand);
			formData.append('description', description);
			formData.append('price', price);
			formData.append('sale_price', sale_price);
			formData.append('sale_start', sale_start);
			formData.append('sale_end', sale_end);
			formData.append('currency', currency);
			formData.append('stock', stock.toString());
			formData.append('status', status);
			formData.append('weight_grams', weight_grams);
			formData.append('dimensions_cm', dimensions_cm);
			formData.append('track_inventory', track_inventory.toString());
			formData.append('allow_backorders', allow_backorders.toString());
			images.forEach((img) => formData.append('images', img));
			formData.append('existing_images', JSON.stringify(existingImages));
			formData.append('categories', categories);
			formData.append('attributes', attributes);

			const res = await fetch(`/api/admin/products/${productSku}`, {
				method: 'PUT',
				body: formData
			});

			if (!res.ok) {
				const errorData = await res.json();
				error = errorData.error || 'Failed to update product.';
			} else {
				success = 'Product updated successfully!';
				setTimeout(() => {
					goto('/admin/products');
				}, 2000);
			}
		} catch (e) {
			error = 'Error: ' + e;
		} finally {
			loading = false;
		}
	}

	async function deleteProduct() {
		if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
			return;
		}

		try {
			const response = await fetch(`/api/admin/products/${productSku}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				goto('/admin/products');
			} else {
				error = 'Failed to delete product';
			}
		} catch (err) {
			console.error('Error deleting product:', err);
			error = 'Failed to delete product';
		}
	}
</script>

<svelte:head>
	<title>Edit Product: {name} | Admin | Valle Sagrado</title>
</svelte:head>

{#if loading && !data?.product}
	<div class="flex justify-center items-center py-12">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
	</div>
{:else}
	<main class="container mx-auto px-6 py-12 max-w-4xl">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold mb-2">Edit Product</h1>
				<p class="text-gray-600">Update product information and settings</p>
			</div>
			<div class="flex gap-3">
				<a href="/admin/products" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
					← Back to Products
				</a>
				<a href="/products/{slug || sku}" target="_blank" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
					View Product
				</a>
			</div>
		</div>

		{#if error}
			<div class="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-200">{error}</div>
		{/if}
		{#if success}
			<div class="bg-green-100 text-green-700 p-4 rounded-lg mb-6 border border-green-200">{success}</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- Basic Information -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">Basic Information</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="sku" class="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
						<input id="sku" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" bind:value={sku} required readonly />
						<p class="text-xs text-gray-500 mt-1">SKU cannot be changed</p>
					</div>
					<div>
						<label for="slug" class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
						<input id="slug" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" bind:value={slug} />
					</div>
					<div class="md:col-span-2">
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
						<input id="name" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" bind:value={name} required />
					</div>
					<div>
						<label for="brand" class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
						<input id="brand" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" bind:value={brand} />
					</div>
					<div>
						<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
						<select id="status" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" bind:value={status} required>
							<option value="draft">Draft</option>
							<option value="active">Active</option>
							<option value="archived">Archived</option>
						</select>
					</div>
					<div class="md:col-span-2">
						<label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
						<textarea id="description" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" bind:value={description} required></textarea>
					</div>
				</div>
			</div>

			<!-- Pricing -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">Pricing</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div>
						<label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price *</label>
						<input id="price" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" step="0.01" bind:value={price} required />
					</div>
					<div>
						<label for="sale_price" class="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
						<input id="sale_price" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" step="0.01" bind:value={sale_price} />
					</div>
					<div>
						<label for="currency" class="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
						<input id="currency" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" bind:value={currency} maxlength="3" required />
					</div>
					<div>
						<label for="sale_start" class="block text-sm font-medium text-gray-700 mb-1">Sale Start</label>
						<input id="sale_start" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="datetime-local" bind:value={sale_start} />
					</div>
					<div>
						<label for="sale_end" class="block text-sm font-medium text-gray-700 mb-1">Sale End</label>
						<input id="sale_end" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="datetime-local" bind:value={sale_end} />
					</div>
				</div>
			</div>

			<!-- Inventory -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">Inventory</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="stock" class="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
						<input id="stock" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" bind:value={stock} required />
					</div>
					<div class="space-y-3">
						<div class="flex items-center">
							<input id="track_inventory" type="checkbox" bind:checked={track_inventory} class="mr-2" />
							<label for="track_inventory" class="text-sm font-medium text-gray-700">Track inventory</label>
						</div>
						<div class="flex items-center">
							<input id="allow_backorders" type="checkbox" bind:checked={allow_backorders} class="mr-2" />
							<label for="allow_backorders" class="text-sm font-medium text-gray-700">Allow backorders</label>
						</div>
					</div>
				</div>
			</div>

			<!-- Images -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">Images</h2>
				
				{#if existingImages.length > 0}
					<div class="mb-4">
						<h3 class="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							{#each existingImages as imageUrl, index}
								<div class="relative">
									<img src={imageUrl} alt="Product" class="w-full h-24 object-cover rounded-lg border" />
									<button
										type="button"
										on:click={() => removeExistingImage(index)}
										class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
									>
										×
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div>
					<label for="images" class="block text-sm font-medium text-gray-700 mb-1">Add New Images</label>
					<input id="images" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="file" multiple accept="image/*" on:change={handleImages} />
					<p class="text-xs text-gray-500 mt-1">Select multiple images to add to the product</p>
				</div>
			</div>

			<!-- Additional Information -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold mb-4">Additional Information</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="weight_grams" class="block text-sm font-medium text-gray-700 mb-1">Weight (grams)</label>
						<input id="weight_grams" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" bind:value={weight_grams} />
					</div>
					<div>
						<label for="dimensions_cm" class="block text-sm font-medium text-gray-700 mb-1">Dimensions (JSON)</label>
						<input id="dimensions_cm" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Example: length:10, width:5, height:2" bind:value={dimensions_cm} />
					</div>
					<div>
						<label for="categories" class="block text-sm font-medium text-gray-700 mb-1">Categories (JSON array)</label>
						<input id="categories" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" bind:value={categories} />
					</div>
					<div>
						<label for="attributes" class="block text-sm font-medium text-gray-700 mb-1">Attributes (JSON object)</label>
						<input id="attributes" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" bind:value={attributes} />
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex justify-between items-center pt-6">
				<button
					type="button"
					on:click={deleteProduct}
					class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
				>
					Delete Product
				</button>
				
				<div class="flex gap-3">
					<a href="/admin/products" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
						Cancel
					</a>
					<button
						type="submit"
						disabled={loading}
						class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
					>
						{loading ? 'Updating...' : 'Update Product'}
					</button>
				</div>
			</div>
		</form>
	</main>
{/if} 