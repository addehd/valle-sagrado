<script lang="ts">
	import LoginFormFields from '../routes/auth/LoginFormFields.svelte';
	import { invalidateAll } from '$app/navigation';
	
	let { showModal = false, onClose = () => {} }: { showModal?: boolean; onClose?: () => void } = $props();
	
	function handleClose() {
		onClose();
	}
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}
	
	async function handleLoginSuccess() {
		// Close modal
		onClose();
		
		// Wait a moment for Supabase to save the session cookie
		await new Promise(resolve => setTimeout(resolve, 500));
		
		// Invalidate all data to reload with new session
		await invalidateAll();
	}
</script>

{#if showModal}
	<!-- Modal Backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal Content -->
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full relative">
			<!-- Close Button -->
			<button
				type="button"
				onclick={handleClose}
				class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
				aria-label="Close modal"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			
			<!-- Modal Body -->
			<div class="p-6 space-y-4">
				<div class="flex justify-center mb-4">
					<img class="w-16" src="/images/sun.svg" alt="logo">
				</div>
				
				<h1 id="modal-title" class="text-xl font-bold text-center text-gray-900">
					Logga in
				</h1>
				
				<!-- Use the shared LoginFormFields component -->
				<LoginFormFields isModal={true} onSuccess={handleLoginSuccess} />
			</div>
		</div>
	</div>
{/if}

<style>
	/* Prevent body scroll when modal is open */
	:global(body:has(.fixed.inset-0)) {
		overflow: hidden;
	}
</style>
