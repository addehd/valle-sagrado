<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let files: FileList;
	let dragActive = false;
	let uploading = false;

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
		
		if (e.dataTransfer?.files) {
			files = e.dataTransfer.files;
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">CSV Product Upload</h1>
	<p class="text-gray-600 dark:text-gray-400 mb-8">
		Upload a CSV file to create multiple products at once for 
		{#if data.project}
			<span class="font-semibold text-blue-600 dark:text-blue-400">{data.project.name}</span>
		{:else}
			your project
		{/if}
	</p>

	{#if data.error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
					<p class="mt-1 text-sm text-red-700 dark:text-red-300">{data.error}</p>
				</div>
			</div>
		</div>
	{/if}

	{#if data.message}
		<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warning</h3>
					<p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">{data.message}</p>
				</div>
			</div>
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
					<p class="mt-1 text-sm text-green-700 dark:text-green-300">{form.message}</p>
					{#if form.results}
						<div class="mt-2 text-sm text-green-700 dark:text-green-300">
							<p>Total rows processed: {form.results.total}</p>
							<p>Successfully created: {form.results.successful}</p>
							<p>Failed: {form.results.failed}</p>
						</div>
						{#if form.results.errors.length > 0}
							<details class="mt-2">
								<summary class="cursor-pointer text-sm text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200">
									View errors ({form.results.errors.length})
								</summary>
								<div class="mt-2 max-h-32 overflow-y-auto">
									{#each form.results.errors as error}
										<p class="text-xs text-green-600 dark:text-green-400">{error}</p>
									{/each}
								</div>
							</details>
						{/if}
					{/if}
				</div>
			</div>
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Upload Error</h3>
					<p class="mt-1 text-sm text-red-700 dark:text-red-300">{form.error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Upload Form -->
	{#if data.project}
		<form method="post" action="?/upload" enctype="multipart/form-data" 
			use:enhance={() => {
				uploading = true;
				return async ({ update }) => {
					uploading = false;
					await update();
				};
			}}>
			
			<!-- File Drop Zone -->
			<div class="max-w-2xl">
			<div 
				role="button"
				tabindex="0"
				class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-colors
					{dragActive ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'hover:border-gray-400 dark:hover:border-gray-500'}"
				on:dragover={handleDragOver}
				on:dragleave={handleDragLeave}
				on:drop={handleDrop}
			>
					<svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
						<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
					
					<div class="mb-4">
						<label for="csvFile" class="cursor-pointer">
							<span class="text-lg font-medium text-gray-700 dark:text-gray-300">
								Drop your CSV file here, or <span class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">click to browse</span>
							</span>
						</label>
						<input 
							id="csvFile"
							name="csvFile" 
							type="file" 
							accept=".csv" 
							bind:files
							class="hidden"
							required
						/>
					</div>

					{#if files && files[0]}
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
							<div class="flex items-center justify-between">
								<div class="flex items-center">
									<svg class="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
									<span class="text-sm font-medium text-gray-700 dark:text-gray-300">{files[0].name}</span>
								</div>
								<span class="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(files[0].size)}</span>
							</div>
						</div>
					{/if}

					<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
						Maximum file size: 10MB | Supported format: CSV
					</p>
				</div>
			</div>

			<!-- Upload Button -->
			<div class="mt-6 flex items-center space-x-4">
				<button 
					type="submit" 
					disabled={!files || files.length === 0 || uploading}
					class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
				>
					{#if uploading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Uploading...
					{:else}
						Upload CSV
					{/if}
				</button>
				
				<a 
					href="/csv-upload-example.md"
					target="_blank"
					class="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
				>
					View CSV Format Guide
				</a>
			</div>
		</form>
	{/if}

	<!-- Information Section -->
	<div class="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">CSV Upload Instructions</h3>
		
		<div class="space-y-4 text-sm text-gray-600 dark:text-gray-400">
			<div>
				<h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">Required Columns:</h4>
				<ul class="list-disc list-inside space-y-1 ml-4">
					<li>Handle - Unique product identifier</li>
					<li>Title - Product name</li>
					<li>Vendor - Brand or manufacturer</li>
					<li>Published - TRUE/FALSE for product status</li>
					<li>Variant SKU - Unique stock code</li>
					<li>Variant Price - Product price (numbers only)</li>
					<li>Variant Inventory Qty - Stock quantity</li>
					<li>Variant Grams - Weight in grams</li>
				</ul>
			</div>

			<div>
				<h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">Optional Columns:</h4>
				<ul class="list-disc list-inside space-y-1 ml-4">
					<li>Body (HTML) - Product description</li>
					<li>Type - Product category</li>
					<li>Tags - Comma-separated tags</li>
					<li>Variant Compare At Price - Original price</li>
					<li>Image Src - Product image URL</li>
					<li>Cost per item - Cost price</li>
				</ul>
			</div>

			<div>
				<h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">Processing Notes:</h4>
				<ul class="list-disc list-inside space-y-1 ml-4">
					<li>The system will validate all data before creating products</li>
					<li>Duplicate SKUs will be rejected</li>
					<li>Products with errors will be reported</li>
					<li>Successfully created products will be active based on the Published column</li>
				</ul>
			</div>
		</div>
	</div>
</div> 