<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	interface GeneratedDesign {
		imageUrl: string;
		prompt: string;
		aiPrompt: string;
		colorCount: number;
		style: string;
		timestamp: string;
		revisedPrompt?: string;
	}

	interface CachedDesign extends GeneratedDesign {
		cacheKey: string;
		cachedAt: number;
	}

	interface SavedDesign {
		id: string;
		user_id: string | null;
		image_url: string;
		prompt: string;
		metadata: Record<string, any>;
		created_at: string;
		updated_at: string;
	}

	let loading = false;

	let customPrompt = '';
	let predefinedOption = '';
	let colorCount = 1;
	let generatedDesign: GeneratedDesign | null = null;
	let error: string | null = null;

	let imageLoading = false;
	let imageError = false;
	let zoomLevel = 1;
	let showMetadata = false;
	let lastRequestTime = 0;
	let activeRequest: Promise<any> | null = null;
	let designHistory: CachedDesign[] = [];
	let showExportModal = false;
	let exportFormat = 'png';
	let exportQuality = 'high';
	let includeMetadata = true;
	let exportLoading = false;

	const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
	const THROTTLE_DELAY = 2000; // 2 seconds between requests
	const CACHE_KEY_PREFIX = 'tshirt_design_';
	const HISTORY_KEY = 'tshirt_design_history';
	const MAX_HISTORY_SIZE = 10;

	const predefinedOptions = [
		{ value: 'red-flowers', label: 'Red logo with flowers' },
		{ value: 'minimalist-icon', label: 'Minimalist icon' },
		{ value: 'vintage-badge', label: 'Vintage badge' },
		{ value: 'geometric-pattern', label: 'Geometric pattern' },
		{ value: 'nature-inspired', label: 'Nature-inspired design' }
	];

	// Cache utility functions
	function generateCacheKey(prompt: string, option: string, colors: number): string {
		const baseKey = option || prompt.toLowerCase().trim();
		return `${CACHE_KEY_PREFIX}${baseKey}_${colors}`;
	}

	function getCachedDesign(cacheKey: string): CachedDesign | null {
		if (!browser) return null;
		
		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				const design: CachedDesign = JSON.parse(cached);
				if (Date.now() - design.cachedAt < CACHE_DURATION) {
					return design;
				} else {
					localStorage.removeItem(cacheKey);
				}
			}
		} catch (error) {
			console.error('Error reading from cache:', error);
		}
		return null;
	}

	function setCachedDesign(cacheKey: string, design: GeneratedDesign): void {
		if (!browser) return;
		
		try {
			const cachedDesign: CachedDesign = {
				...design,
				cacheKey,
				cachedAt: Date.now()
			};
			localStorage.setItem(cacheKey, JSON.stringify(cachedDesign));
			
			// Update history
			updateDesignHistory(cachedDesign);
		} catch (error) {
			console.error('Error saving to cache:', error);
		}
	}

	function updateDesignHistory(design: CachedDesign): void {
		if (!browser) return;
		
		try {
			let history = getDesignHistory();
			
			// Remove duplicate if exists
			history = history.filter(d => d.cacheKey !== design.cacheKey);
			
			// Add new design to beginning
			history.unshift(design);
			
			// Limit history size
			if (history.length > MAX_HISTORY_SIZE) {
				history = history.slice(0, MAX_HISTORY_SIZE);
			}
			
			designHistory = history;
			localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
		} catch (error) {
			console.error('Error updating history:', error);
		}
	}

	function getDesignHistory(): CachedDesign[] {
		if (!browser) return [];
		
		try {
			const stored = localStorage.getItem(HISTORY_KEY);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.error('Error reading history:', error);
		}
		return [];
	}

	function clearCache(): void {
		if (!browser) return;
		
		try {
			// Clear all design caches
			const keys = Object.keys(localStorage);
			keys.forEach(key => {
				if (key.startsWith(CACHE_KEY_PREFIX)) {
					localStorage.removeItem(key);
				}
			});
			
			// Clear history
			localStorage.removeItem(HISTORY_KEY);
			designHistory = [];
		} catch (error) {
			console.error('Error clearing cache:', error);
		}
	}

	function preloadImage(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = reject;
			img.src = url;
		});
	}

	function isThrottled(): boolean {
		return Date.now() - lastRequestTime < THROTTLE_DELAY;
	}

	function handleSubmit() {
		loading = true;
		error = null;
		generatedDesign = null;
	}

	function handleResult(result: ActionResult) {
		loading = false;
		
		console.log('Form submission result:', result);
		console.log('Result type:', result.type);
		
		if (result.type === 'success') {
			// For successful SvelteKit actions, the returned object is in result.data
			const data = (result as any).data;
			console.log('Result data:', data);
			
			// Check if we have the success flag and design data
			if (data?.success && data?.design) {
				generatedDesign = data.design;
				error = null; // Clear any previous errors
				console.log('Successfully set generatedDesign:', generatedDesign);
				
				// Note: The design has been auto-saved to the database, 
				// so it will appear in the gallery on the next natural page refresh
			} else {
				error = 'No design data received from server';
				console.log('No design found in result.data or success flag missing');
				console.log('Available data keys:', Object.keys(data || {}));
			}
		} else if (result.type === 'failure') {
			const data = (result as any).data;
			error = data?.error || 'Failed to generate design';
			generatedDesign = null;
		}
	}



	$: isFormValid = customPrompt.trim() || predefinedOption;

	function loadFromHistory(cachedDesign: CachedDesign): void {
		generatedDesign = cachedDesign;
		imageLoading = true;
		zoomLevel = 1;
		
		// Update form values
		customPrompt = cachedDesign.style === 'custom' ? cachedDesign.prompt : '';
		predefinedOption = cachedDesign.style !== 'custom' ? cachedDesign.style : '';
		colorCount = cachedDesign.colorCount;
		
		// Preload image
		preloadImage(cachedDesign.imageUrl)
			.then(() => {
				imageLoading = false;
				imageError = false;
			})
			.catch(() => {
				imageLoading = false;
				imageError = true;
			});
	}

	function handleImageLoad() {
		imageLoading = false;
		imageError = false;
	}

	function handleImageError() {
		imageLoading = false;
		imageError = true;
	}

	function zoomIn() {
		if (zoomLevel < 3) {
			zoomLevel += 0.25;
		}
	}

	function zoomOut() {
		if (zoomLevel > 0.5) {
			zoomLevel -= 0.25;
		}
	}

	function resetZoom() {
		zoomLevel = 1;
	}

	async function downloadImage(format: string = 'png', quality: string = 'high') {
		if (!generatedDesign?.imageUrl) return;
		
		exportLoading = true;
		
		try {
			// Create filename with timestamp
			const timestamp = new Date().toISOString().split('T')[0];
			const filename = `tshirt-design-${timestamp}`;
			
			if (format === 'png' || format === 'jpg') {
				// For raster formats, download directly
				const link = document.createElement('a');
				link.href = generatedDesign.imageUrl;
				link.download = `${filename}.${format}`;
				link.click();
				
			} else if (format === 'svg') {
				// Convert to SVG format (simplified conversion)
				const svgContent = await createSVGFromImage(generatedDesign.imageUrl);
				const blob = new Blob([svgContent], { type: 'image/svg+xml' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `${filename}.svg`;
				link.click();
				URL.revokeObjectURL(url);
				
			} else if (format === 'pdf') {
				// Create PDF with design and metadata
				await createPDFExport(generatedDesign, filename);
				
			} else if (format === 'json') {
				// Export as JSON with all metadata
				const exportData = {
					design: generatedDesign,
					exportedAt: new Date().toISOString(),
					format: format,
					quality: quality,
					metadata: {
						userAgent: navigator.userAgent,
						timestamp: Date.now(),
						version: '1.0'
					}
				};
				
				const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `${filename}.json`;
				link.click();
				URL.revokeObjectURL(url);
			}
			
			showExportModal = false;
			
		} catch (error) {
			console.error('Export failed:', error);
			alert('Export failed. Please try again.');
		} finally {
			exportLoading = false;
		}
	}

	async function createSVGFromImage(imageUrl: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				
				canvas.width = img.width;
				canvas.height = img.height;
				
				ctx?.drawImage(img, 0, 0);
				
				// Create SVG with embedded image
				const svgContent = `
					<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
						<image href="${imageUrl}" width="${img.width}" height="${img.height}" />
						${includeMetadata ? `
							<metadata>
								<title>${generatedDesign?.prompt || 'T-Shirt Design'}</title>
								<description>Generated t-shirt design</description>
								<creator>Valle Sagrado T-Shirt Designer</creator>
								<created>${generatedDesign?.timestamp}</created>
							</metadata>
						` : ''}
					</svg>
				`;
				
				resolve(svgContent.trim());
			};
			img.onerror = reject;
			img.src = imageUrl;
		});
	}

	async function createPDFExport(design: GeneratedDesign, filename: string): Promise<void> {
		// Create a simple PDF with the design and metadata
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;
		
		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
				<head>
					<title>T-Shirt Design - ${design.prompt}</title>
					<style>
						body {
							font-family: Arial, sans-serif;
							margin: 20px;
							text-align: center;
						}
						.design-container {
							max-width: 600px;
							margin: 0 auto;
							padding: 20px;
							border: 1px solid #ddd;
							border-radius: 8px;
						}
						.design-image {
							max-width: 100%;
							height: auto;
							margin: 20px 0;
						}
						.metadata {
							text-align: left;
							margin-top: 20px;
							padding: 15px;
							background: #f5f5f5;
							border-radius: 5px;
						}
						.print-only {
							display: none;
						}
						@media print {
							.print-only {
								display: block;
							}
						}
					</style>
				</head>
				<body>
					<div class="design-container">
						<h1>T-Shirt Design</h1>
						<img src="${design.imageUrl}" alt="T-Shirt Design" class="design-image" />
						
						${includeMetadata ? `
							<div class="metadata">
								<h3>Design Details</h3>
								<p><strong>Prompt:</strong> ${design.prompt}</p>
								<p><strong>Colors:</strong> ${design.colorCount}</p>
								<p><strong>Style:</strong> ${design.style}</p>
								<p><strong>Created:</strong> ${new Date(design.timestamp).toLocaleString()}</p>
								${design.revisedPrompt ? `<p><strong>AI Enhanced:</strong> ${design.revisedPrompt}</p>` : ''}
							</div>
						` : ''}
						
						<div class="print-only">
							<p style="margin-top: 30px; font-size: 12px; color: #666;">
								Generated by Valle Sagrado T-Shirt Designer
							</p>
						</div>
					</div>
				</body>
			</html>
		`);
		
		printWindow.document.close();
		
		// Wait for image to load then print
		setTimeout(() => {
			printWindow.print();
		}, 1000);
	}

	async function saveToAccount(): Promise<void> {
		if (!generatedDesign) return;
		
		try {
			// Check if user is logged in
			const response = await fetch('/api/designs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					design: generatedDesign,
					action: 'save'
				})
			});
			
			if (response.ok) {
				alert('Design saved to your account!');
			} else {
				const error = await response.json();
				alert(error.message || 'Failed to save design. Please try again.');
			}
		} catch (error) {
			console.error('Save failed:', error);
			alert('Failed to save design. Please try again.');
		}
	}

	async function exportAllHistory(): Promise<void> {
		if (designHistory.length === 0) return;
		
		exportLoading = true;
		
		try {
			const exportData = {
				designs: designHistory,
				exportedAt: new Date().toISOString(),
				totalDesigns: designHistory.length,
				metadata: {
					userAgent: navigator.userAgent,
					timestamp: Date.now(),
					version: '1.0'
				}
			};
			
			const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `tshirt-designs-history-${new Date().toISOString().split('T')[0]}.json`;
			link.click();
			URL.revokeObjectURL(url);
			
		} catch (error) {
			console.error('Export failed:', error);
			alert('Export failed. Please try again.');
		} finally {
			exportLoading = false;
		}
	}

	function shareDesign() {
		if (navigator.share && generatedDesign?.imageUrl) {
			navigator.share({
				title: 'My T-Shirt Design',
				text: `Check out this t-shirt design: ${generatedDesign.prompt}`,
				url: generatedDesign.imageUrl
			});
		} else {
			// Fallback: copy URL to clipboard
			navigator.clipboard.writeText(generatedDesign?.imageUrl || '');
			alert('Design URL copied to clipboard!');
		}
	}

	function regenerateDesign() {
		// Clear current design and resubmit form
		generatedDesign = null;
		error = null;
		const form = document.querySelector('form');
		if (form) {
			form.dispatchEvent(new Event('submit'));
		}
	}

	function formatDate(dateString: string): string {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch (error) {
			return dateString;
		}
	}

	function navigateToPage(page: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', page.toString());
		window.location.href = url.toString();
	}

	// Load design history on mount
	onMount(() => {
		if (browser) {
			designHistory = getDesignHistory();
		}
	});
</script>

<svelte:head>
	<title>Design Your Own T-Shirt</title>
	<meta name="description" content="Create custom t-shirt designs with AI" />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-4xl mx-auto px-4">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Design Your Own T-Shirt</h1>
			<p class="text-lg text-gray-600">Create unique t-shirt designs with AI-powered generation</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Design Form -->
			<div class="bg-white rounded-lg shadow-md p-6">
				<h2 class="text-2xl font-semibold text-gray-800 mb-6">Design Specifications</h2>
				
				<form 
					method="POST" 
					action="?/generateDesign"
					use:enhance={() => {
						handleSubmit();
						return async ({ result }) => {
							handleResult(result);
						};
					}}
				>
					<!-- Custom Prompt -->
					<div class="mb-6">
						<label for="customPrompt" class="block text-sm font-medium text-gray-700 mb-2">
							Custom Design Description
						</label>
						<textarea
							id="customPrompt"
							name="customPrompt"
							bind:value={customPrompt}
							placeholder="Describe your t-shirt design (e.g., 'a cool dragon logo', 'mountain silhouette', etc.)"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							rows="3"
						></textarea>
					</div>

					<!-- Predefined Options -->
					<div class="mb-6">
						<label for="predefinedOption" class="block text-sm font-medium text-gray-700 mb-2">
							Or Choose a Predefined Style
						</label>
						<select
							id="predefinedOption"
							name="predefinedOption"
							bind:value={predefinedOption}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select a style...</option>
							{#each predefinedOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>

					<!-- Color Count -->
					<div class="mb-6">
						<label for="colorCount" class="block text-sm font-medium text-gray-700 mb-2">
							Number of Colors (1-3)
						</label>
						<select
							id="colorCount"
							name="colorCount"
							bind:value={colorCount}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value={1}>1 Color (Monochrome)</option>
							<option value={2}>2 Colors</option>
							<option value={3}>3 Colors</option>
						</select>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						disabled={loading || !isFormValid}
						class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{#if loading}
							<div class="flex items-center justify-center">
								<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
								Generating Design...
							</div>
						{:else}
							Generate T-Shirt Design
						{/if}
					</button>
				</form>

				<!-- Error Display -->
				{#if error}
					<div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
						<p class="font-medium">Error:</p>
						<p>{error}</p>
					</div>
				{/if}
			</div>

			<!-- Design Preview -->
			<div class="bg-white rounded-lg shadow-md p-6">
				<h2 class="text-2xl font-semibold text-gray-800 mb-6">Design Preview</h2>
				
				<div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
					{#if loading}
						<div class="text-center">
							<div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
							<p class="text-gray-600">Creating your design...</p>
							<p class="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
						</div>
					{:else if generatedDesign}
						<div class="w-full h-full flex items-center justify-center">
							<img 
								src={generatedDesign.imageUrl} 
								alt="Generated t-shirt design" 
								class="max-w-full max-h-full object-contain"
								on:load={() => {
									console.log('✅ Image loaded successfully');
								}}
								on:error={(e) => {
									console.error('❌ Image failed to load:', e);
									console.error('❌ Image URL:', generatedDesign?.imageUrl);
									error = 'Failed to load generated image. The image may have expired or be temporarily unavailable.';
								}}
							/>
						</div>
					{:else}
						<div class="text-center">
							<svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
							</svg>
							<p class="text-gray-600 mt-2">Your design will appear here</p>
							<p class="text-sm text-gray-500 mt-1">High-quality 1024×1024 resolution</p>
						</div>
					{/if}
				</div>

				<!-- Design Details -->
				{#if generatedDesign}
					<div class="mt-6 p-4 bg-gray-50 rounded-md">
						<h3 class="font-semibold text-gray-800 mb-2">Design Details</h3>
						<div class="space-y-1 text-sm text-gray-600">
							<p><strong>Original Prompt:</strong> {generatedDesign.prompt}</p>
							<p><strong>Colors:</strong> {generatedDesign.colorCount}</p>
							<p><strong>Style:</strong> {generatedDesign.style}</p>
							<p><strong>Created:</strong> {new Date(generatedDesign.timestamp).toLocaleString()}</p>
							{#if generatedDesign.revisedPrompt}
								<p><strong>AI Enhanced Prompt:</strong> {generatedDesign.revisedPrompt}</p>
							{/if}
						</div>
						
						<!-- Download Button -->
						<div class="mt-4">
							<a 
								href={generatedDesign.imageUrl} 
								download="tshirt-design.png"
								class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
							>
								<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
								Download Design
							</a>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div> 

{#if generatedDesign}
	<div class="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
		<div class="flex items-center mb-2">
			<svg class="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			<h3 class="text-lg font-semibold text-green-800">Design Auto-Saved!</h3>
		</div>
		<p class="text-green-700 text-sm">
			Your design has been automatically saved to your gallery. You can find it in the "Saved Designs" section below.
		</p>
	</div>
{/if}

<!-- Saved Designs Gallery -->
<div class="mt-12 border-t pt-8">
	<h2 class="text-2xl font-bold mb-6 text-gray-800">Saved Designs</h2>
	
	{#if data.designs.length === 0}
		<div class="text-center py-12">
			<div class="text-gray-400 text-6xl mb-4">
				🎨
			</div>
			<p class="text-gray-500 text-lg">No saved designs yet.</p>
			<p class="text-gray-400 text-sm mt-2">Generate and save your first design to see it here!</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{#each data.designs as design (design.id)}
				<div class="relative rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow group bg-white">
					<div class="aspect-square relative">
						<img 
							src={design.image_url} 
							alt={design.prompt.substring(0, 50)} 
							class="w-full h-full object-cover"
							loading="lazy"
						/>
						
						<!-- Hover overlay with details -->
						<div class="absolute inset-0 bg-black bg-opacity-80 p-4 text-white overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="h-full flex flex-col justify-between">
								<div>
									<p class="font-medium text-sm mb-2 text-blue-200">
										{formatDate(design.created_at)}
									</p>
									<p class="text-sm mb-3 line-clamp-4">
										{design.prompt}
									</p>
									
									{#if design.metadata?.colorCount}
										<p class="text-xs text-gray-300 mb-1">
											Colors: {design.metadata.colorCount}
										</p>
									{/if}
									
									{#if design.metadata?.style}
										<p class="text-xs text-gray-300 mb-1">
											Style: {design.metadata.style}
										</p>
									{/if}
									
									{#if design.metadata?.model}
										<p class="text-xs text-gray-300">
											Model: {design.metadata.model}
										</p>
									{/if}
								</div>
								
								<div class="flex gap-2 mt-4">
									<a 
										href={design.image_url} 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded text-center hover:bg-blue-700 transition-colors"
									>
										View Full
									</a>
									<a 
										href={design.image_url} 
										download="design-{design.id}.png"
										class="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded text-center hover:bg-green-700 transition-colors"
									>
										Download
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Pagination -->
		{#if data.totalPages > 1}
			<div class="mt-8 flex justify-center">
				<nav class="flex items-center space-x-2">
					{#if data.page > 1}
						<button 
							on:click={() => navigateToPage(data.page - 1)}
							class="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
						>
							Previous
						</button>
					{/if}
					
					{#each Array(data.totalPages) as _, i}
						{@const pageNum = i + 1}
						<button 
							on:click={() => navigateToPage(pageNum)}
							class="px-3 py-2 text-sm rounded transition-colors {pageNum === data.page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
						>
							{pageNum}
						</button>
					{/each}
					
					{#if data.page < data.totalPages}
						<button 
							on:click={() => navigateToPage(data.page + 1)}
							class="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
						>
							Next
						</button>
					{/if}
				</nav>
			</div>
		{/if}
	{/if}
</div> 