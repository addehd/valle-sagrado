<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

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
			const design = data?.design;
			console.log('Extracted design from result.data:', design);
			
			if (design) {
				generatedDesign = design;
				error = null; // Clear any previous errors
				console.log('Successfully set generatedDesign');
			} else {
				error = 'No design data received from server';
				console.log('No design found in result.data');
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
								on:error={() => {
									error = 'Failed to load generated image';
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