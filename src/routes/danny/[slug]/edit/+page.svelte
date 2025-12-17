<script lang="ts">
	import MarkdownEditor from '$components/MarkdownEditor.svelte';
	import Hero from '../../components/Hero.svelte';
	
	const { data, form } = $props();
	
	// Get page data
	const page = data.page || {};
	
	// Initialize form values
	let title = $state(page.title || '');
	let content = $state(page.content || '');
	let metaDescription = $state(page.meta_description || '');
	let isActive = $state(page.is_active ?? true);
	
	function handleContentChange(newContent: string) {
		content = newContent;
	}
</script>

<svelte:head>
	<title>Edit: {page.title || 'Page'} – Danny</title>
</svelte:head>

<div class="min-h-screen bg-white">
	<Hero title="Edit page" />
	
	<div class="max-w-4xl mx-auto px-6 py-16">
		
		<!-- Success/Error messages -->
		{#if form?.success}
			<div class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
				<p class="font-medium">Success!</p>
				<p>{form.message || 'Page updated successfully'}</p>
			</div>
		{/if}
		
		{#if form?.error}
			<div class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
				<p class="font-medium">Error</p>
				<p>{form.message || 'There was a problem updating the page'}</p>
			</div>
		{/if}
		
		<form method="POST" action="?/updatePage" class="space-y-6">
			
			<!-- Hidden page ID -->
			<input type="hidden" name="page_id" value={page.id} />
			
			<!-- Title -->
			<div>
				<label for="title" class="block mb-2 text-sm font-medium text-gray-900">
					Page title
				</label>
				<input 
					type="text" 
					id="title" 
					name="title"
					bind:value={title}
					class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-yellow-400 focus:border-yellow-400" 
					required
				/>
			</div>
			
			<!-- Meta Description -->
			<div>
				<label for="meta_description" class="block mb-2 text-sm font-medium text-gray-900">
					Meta description (SEO)
				</label>
				<textarea 
					id="meta_description" 
					name="meta_description"
					bind:value={metaDescription}
					rows="2"
					class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-yellow-400 focus:border-yellow-400"
					placeholder="Short description for search engines"
				></textarea>
			</div>
			
			<!-- Content with Markdown Editor -->
			<div>
				<label for="content" class="block mb-2 text-sm font-medium text-gray-900">
					Content
					<span class="text-xs text-gray-500 font-normal ml-2">
						(Markdown format with image support)
					</span>
				</label>
		<MarkdownEditor 
			value={content} 
			onChange={handleContentChange}
			uploadEndpoint="/danny/{page.slug}" />
				<input type="hidden" name="content" bind:value={content} />
			</div>
			
			<!-- Active Status -->
			<div class="flex items-center">
				<input 
					type="checkbox" 
					id="is_active" 
					name="is_active"
					bind:checked={isActive}
					class="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 rounded focus:ring-yellow-400"
				/>
				<label for="is_active" class="ml-2 text-sm font-medium text-gray-900">
					Active page (visible on the site)
				</label>
			</div>
			
			<!-- Action Buttons -->
			<div class="flex gap-4">
				<button 
					type="submit" 
					class="px-6 py-3 text-sm font-semibold text-white bg-black hover:bg-gray-800 transition-colors rounded"
				>
					Save changes
				</button>
				
				<a 
					href="/danny/{page.slug}" 
					class="px-6 py-3 text-sm font-semibold text-black bg-white border-2 border-black hover:bg-gray-100 transition-colors rounded"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>

<style>
	/* Additional custom styles if needed */
</style>
