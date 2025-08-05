<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	
	const dispatch = createEventDispatcher();
	
	export let isOpen = false;
	export let selectedServices: any[] = [];
	export let translations: any;
	
	let logoFile: File | null = null;
	let logoPreview: string | null = null;
	let isSubmitting = false;
	
	// Form data
	let formData = {
		customerName: '',
		email: '',
		phone: '',
		company: '',
		quantity: 100,
		logoPosition: 'center',
		additionalNotes: ''
	};
	
	$: logoPositions = [
		{ value: 'center', label: translations.modal.logoPositions.center },
		{ value: 'top-left', label: translations.modal.logoPositions.topLeft },
		{ value: 'top-right', label: translations.modal.logoPositions.topRight },
		{ value: 'bottom-left', label: translations.modal.logoPositions.bottomLeft },
		{ value: 'bottom-right', label: translations.modal.logoPositions.bottomRight },
		{ value: 'custom', label: translations.modal.logoPositions.custom }
	];
	
	function closeModal() {
		dispatch('close');
		resetForm();
	}
	
	function resetForm() {
		formData = {
			customerName: '',
			email: '',
			phone: '',
			company: '',
			quantity: 100,
			logoPosition: 'center',
			additionalNotes: ''
		};
		logoFile = null;
		logoPreview = null;
		isSubmitting = false;
	}
	
	function handleLogoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file && file.type.startsWith('image/')) {
			logoFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				logoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}
	
	function handleSubmit() {
		isSubmitting = true;
		return async ({ result, update }: any) => {
			if (result?.type === 'success') {
				dispatch('success', result.data);
				closeModal();
			}
			isSubmitting = false;
			await update();
		};
	}
	
	// Close modal when clicking outside
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}
	
	// Manage body scroll when modal opens/closes
	$: if (typeof document !== 'undefined') {
		if (isOpen) {
			// Prevent background scrolling
			document.body.style.overflow = 'hidden';
		} else {
			// Restore background scrolling
			document.body.style.overflow = '';
		}
	}
	
	// Cleanup on component destroy
	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	});
</script>

{#if isOpen}
	<!-- Modal Backdrop -->
	<div 
		class="fixed inset-0 bg-white/20 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		on:click={handleBackdropClick}
		on:keydown={(e) => e.key === 'Escape' && closeModal()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- Modal Content -->
		<div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<!-- Modal Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200">
				<h2 class="text-2xl font-semibold text-gray-900">
					{translations.modal.title}
				</h2>
				<button 
					on:click={closeModal}
					class="text-gray-400 hover:text-gray-600 transition-colors"
					aria-label={translations.modal.close}>

					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<!-- Selected Services Summary -->
			<div class="p-6 bg-gray-50 border-b border-gray-200">
				<h3 class="text-lg font-medium text-gray-900 mb-3">{translations.modal.selectedServices}</h3>
				<div class="space-y-2">
					{#each selectedServices as service, i}
						<div class="flex items-center justify-between bg-white p-3 rounded border">
							<span class="font-medium">{translations.services[service.id - 1]?.title}</span>
							<span class="text-orange-600 font-semibold">{translations.services[service.id - 1]?.price}</span>
						</div>
					{/each}
				</div>
			</div>
			
			<!-- Quote Form -->
			<form 
				method="POST" 
				action="?/requestQuote"
				enctype="multipart/form-data"
				use:enhance={handleSubmit}
				class="p-6"
			>
				<!-- Hidden field for selected services -->
				<input type="hidden" name="selectedServices" value={JSON.stringify(selectedServices.map(s => s.id))} />
				
				<div class="space-y-6">
					<!-- Customer Information -->
					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<label for="customerName" class="block text-sm font-medium text-gray-700 mb-2">
								{translations.modal.fullNameRequired}
							</label>
							<input 
								type="text" 
								id="customerName"
								name="customerName"
								bind:value={formData.customerName}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							/>
						</div>
						
						<div>
							<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
								{translations.modal.emailRequired}
							</label>
							<input 
								type="email" 
								id="email"
								name="email"
								bind:value={formData.email}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							/>
						</div>
					</div>
					
					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
								{translations.modal.phone}
							</label>
							<input 
								type="tel" 
								id="phone"
								name="phone"
								bind:value={formData.phone}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							/>
						</div>
						
						<div>
							<label for="company" class="block text-sm font-medium text-gray-700 mb-2">
								{translations.modal.company}
							</label>
							<input 
								type="text" 
								id="company"
								name="company"
								bind:value={formData.company}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							/>
						</div>
					</div>
					
					<!-- Quantity -->
					<div>
						<label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">
							{translations.modal.quantityRequired}
						</label>
						<input 
							type="number" 
							id="quantity"
							name="quantity"
							bind:value={formData.quantity}
							min="1"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						/>
					</div>
					
					<!-- Logo Upload -->
					<div>
						<label for="logo" class="block text-sm font-medium text-gray-700 mb-2">
							{translations.modal.logoUpload}
						</label>
						<input 
							type="file" 
							id="logo"
							name="logo"
							accept="image/*"
							on:change={handleLogoUpload}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						/>
						{#if logoPreview}
							<div class="mt-2">
								<img src={logoPreview} alt={translations.modal.logoPreview} class="max-w-32 h-auto rounded border" />
							</div>
						{/if}
					</div>
					
					<!-- Logo Position -->
					<div>
						<label for="logoPosition" class="block text-sm font-medium text-gray-700 mb-2">
							{translations.modal.logoPosition}
						</label>
						<select 
							id="logoPosition"
							name="logoPosition"
							bind:value={formData.logoPosition}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						>
							{#each logoPositions as position}
								<option value={position.value}>{position.label}</option>
							{/each}
						</select>
					</div>
					
					<!-- Additional Notes -->
					<div>
						<label for="additionalNotes" class="block text-sm font-medium text-gray-700 mb-2">
							{translations.modal.additionalNotes}
						</label>
						<textarea 
							id="additionalNotes"
							name="additionalNotes"
							bind:value={formData.additionalNotes}
							rows="4"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							placeholder={translations.modal.notesPlaceholder}
						></textarea>
					</div>
				</div>
				
				<!-- Form Actions -->
				<div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
					<button 
						type="button"
						on:click={closeModal}
						class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
						disabled={isSubmitting}
					>
						{translations.modal.cancel}
					</button>
					<button 
						type="submit"
						disabled={isSubmitting}
						class="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{#if isSubmitting}
							<svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							{translations.modal.sending}
						{:else}
							{translations.modal.sendRequest}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}