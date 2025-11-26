<script lang="ts">
	import Hero from '../components/Hero.svelte';
	import { page as pageStore } from '$app/stores';
	
	export let data;
	
	// Force reactivity to URL changes
	$: slug = $pageStore.params.slug;
	
	// Make destructuring reactive to data changes
	$: ({ page = {}, alternatePages = [] } = data || {});

	// Simple markdown to HTML converter (or install marked: pnpm add marked)
	function simpleMarkdown(md: string): string {
		return md
			// Headers
			.replace(/^### (.*$)/gim, '<h3>$1</h3>')
			.replace(/^## (.*$)/gim, '<h2>$1</h2>')
			.replace(/^# (.*$)/gim, '<h1>$1</h1>')
			// Bold
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			// Italic
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			// Images: ![alt](url)
			.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />')
			// Links: [text](url)
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
			// Blockquote
			.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
			// Horizontal rule
			.replace(/^---$/gim, '<hr />')
			// Lists
			.replace(/^\* (.*$)/gim, '<li>$1</li>')
			.replace(/^- (.*$)/gim, '<li>$1</li>')
			.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
			// Wrap lists
			.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
			// Line breaks
			.replace(/\n\n/g, '</p><p>')
			.replace(/\n/g, '<br />');
	}

	// Convert markdown to HTML - with safety check (reactive)
	$: htmlContent = page?.content ? simpleMarkdown(page.content) : '<p>No content available</p>';
	$: pageTitle = page?.title || 'Loading...';
</script>

<svelte:head>
	<title>{pageTitle} – Danny</title>
	{#if page?.meta_description}
		<meta name="description" content={page.meta_description} />
	{/if}
</svelte:head>

{#key slug}
{#if !page}
	<div class="min-h-screen bg-white flex items-center justify-center">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Error</h1>
			<p>No page data available</p>
			<a href="/danny" class="mt-4 inline-block bg-black text-white px-6 py-3">← Back</a>
		</div>
	</div>
{:else}
<div class="min-h-screen bg-white">
	<Hero title={pageTitle} />

	<!-- Language Switcher -->
	<!-- {#if alternatePages.length > 0}
		<div class="max-w-4xl mx-auto px-6 pt-8">
			<div class="flex gap-2 items-center justify-end">
				<span class="text-sm text-gray-600">Other languages:</span>
				{#each alternatePages as altPage}
					<a 
						href="/danny/{altPage.slug}"
						class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-yellow-400 text-black font-semibold text-sm transition-colors rounded">
						<span>{languageFlags[altPage.language] || '🌐'}</span>
						<span>{altPage.title}</span>
					</a>
				{/each}
			</div>
		</div>
	{/if} -->

	<article class="max-w-4xl mx-auto px-6 py-16">
		<div class="prose prose-lg max-w-none">
			{@html htmlContent}
		</div>
	</article>

	<div class="max-w-4xl mx-auto px-6 pb-16 flex gap-4">
		<a 
			href="/danny" 
			class="inline-block bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors">
			← Tillbaka
		</a>
		<a 
			href="/danny/{slug}/edit" 
			class="inline-block bg-yellow-400 text-black px-6 py-3 font-semibold hover:bg-yellow-500 transition-colors">
			✏️ Editar
		</a>
	</div>
</div>
{/if}
{/key}

<style>
	/* Custom styling for markdown content */
	:global(.prose) {
		color: #1a1a1a;
	}

	:global(.prose h1) {
		font-size: 2.25rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		margin-top: 2rem;
	}

	:global(.prose h2) {
		font-size: 1.875rem;
		font-weight: 700;
		margin-bottom: 1rem;
		margin-top: 1.5rem;
		border-bottom: 3px solid #facc15;
		padding-bottom: 0.5rem;
	}

	:global(.prose h3) {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		margin-top: 1rem;
	}

	:global(.prose p) {
		margin-bottom: 1rem;
		line-height: 1.625;
	}

	:global(.prose a) {
		color: #000;
		text-decoration: underline;
		text-decoration-color: #facc15;
		text-decoration-thickness: 2px;
	}

	:global(.prose a:hover) {
		text-decoration-thickness: 4px;
	}

	:global(.prose ul, .prose ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}

	:global(.prose li) {
		margin-bottom: 0.5rem;
	}

	:global(.prose img) {
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
	}

	:global(.prose blockquote) {
		border-left: 4px solid #facc15;
		padding-left: 1rem;
		font-style: italic;
		color: #374151;
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	:global(.prose code) {
		background-color: #f3f4f6;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}

	:global(.prose pre) {
		background-color: #000;
		color: #fff;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	:global(.prose strong) {
		font-weight: 700;
		color: #000;
	}
</style>

