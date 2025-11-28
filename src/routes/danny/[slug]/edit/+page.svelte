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
	
	console.log('🔍 Initial form values loaded:', {
		pageId: page.id,
		title,
		contentLength: content?.length,
		metaDescription,
		isActive
	});
	
	function handleContentChange(newContent: string) {
		console.log('📝 Content changed, length:', newContent?.length);
		content = newContent;
	}
	
	function handleSubmit(event: SubmitEvent) {
		console.log('📤 Form submitting:', {
			title,
			contentLength: content?.length,
			contentPreview: content?.substring(0, 100),
			metaDescription,
			isActive,
			pageId: page.id
		});
		
		// Log FormData contents
		const formElement = event.target as HTMLFormElement;
		const formData = new FormData(formElement);
		console.log('📋 FormData entries:');
		for (const [key, value] of formData.entries()) {
			if (typeof value === 'string') {
				console.log(`  ${key}:`, value.substring(0, 100) + (value.length > 100 ? `... (${value.length} chars)` : ''));
			} else {
				console.log(`  ${key}:`, value);
			}
		}
	}
</script>

<svelte:head>
	<title>Editar: {page.title || 'Página'} – Danny</title>
</svelte:head>

<div class="min-h-screen bg-white">
	<Hero title="Editar Página" />
	
	<div class="max-w-4xl mx-auto px-6 py-16">
		
		<!-- Warning if not the page owner -->
		{#if data.currentUserId && data.page?.user_id !== data.currentUserId}
			<div class="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 text-yellow-800 rounded-lg">
				<p class="font-bold text-lg">⚠️ Esta no es tu página</p>
				<p class="mt-2">Estás viendo una página que pertenece a otro usuario. No podrás guardar cambios.</p>
				<p class="mt-1 text-sm">
					<strong>Usuario propietario:</strong> {data.page.user_id}
				</p>
				<p class="text-sm">
					<strong>Tu usuario:</strong> {data.currentUserId} ({data.currentUserEmail})
				</p>
			</div>
		{/if}
		
		<!-- Success/Error messages -->
		{#if form && !form.error}
			<div class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
				<p class="font-medium">¡Éxito!</p>
				<p>{form.message || 'Página actualizada correctamente'}</p>
			</div>
		{/if}
		
		{#if form?.error}
			<div class="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-800 rounded-lg">
				<p class="font-bold text-lg">⚠️ Error al guardar</p>
				<p class="mt-2">{form.message || 'Hubo un problema al actualizar la página'}</p>
				{#if form.message?.includes('permisos')}
					<p class="mt-3 text-sm bg-red-50 p-3 rounded border border-red-300">
						<strong>Consejo:</strong> Verifica que estés conectado con la cuenta de usuario correcta que tiene permisos para editar esta página.
					</p>
				{/if}
			</div>
		{/if}
		
		<form method="POST" action="?/updatePage" class="space-y-6" onsubmit={handleSubmit}>
			
			<!-- Hidden page ID -->
			<input type="hidden" name="page_id" value={page.id} />
			
			<!-- Title -->
			<div>
				<label for="title" class="block mb-2 text-sm font-medium text-gray-900">
					Título de la página
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
					Meta descripción (SEO)
				</label>
				<textarea 
					id="meta_description" 
					name="meta_description"
					bind:value={metaDescription}
					rows="2"
					class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-yellow-400 focus:border-yellow-400"
					placeholder="Breve descripción para motores de búsqueda"
				></textarea>
			</div>
			
			<!-- Content with Markdown Editor -->
			<div>
				<label for="content" class="block mb-2 text-sm font-medium text-gray-900">
					Contenido
					<span class="text-xs text-gray-500 font-normal ml-2">
						(Formato Markdown con soporte para imágenes)
					</span>
				</label>
				<MarkdownEditor 
					value={content} 
					onChange={handleContentChange} 
				/>
				<input type="hidden" name="content" bind:value={content} />
			</div>
			
			<!-- Active Status -->
			<div class="flex items-center">
				<!-- Hidden input to always send is_active value -->
				<input type="hidden" name="is_active" value={isActive ? 'on' : 'off'} />
				<input 
					type="checkbox" 
					id="is_active" 
					name="is_active_display"
					bind:checked={isActive}
					class="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 rounded focus:ring-yellow-400"
				/>
				<label for="is_active" class="ml-2 text-sm font-medium text-gray-900">
					Página activa (visible en el sitio)
				</label>
			</div>
			
			<!-- Action Buttons -->
			<div class="flex gap-4">
				<button 
					type="submit" 
					class="px-6 py-3 text-sm font-semibold text-white bg-black hover:bg-gray-800 transition-colors rounded"
				>
					Guardar Cambios
				</button>
				
				<a 
					href="/danny/{page.slug}" 
					class="px-6 py-3 text-sm font-semibold text-black bg-white border-2 border-black hover:bg-gray-100 transition-colors rounded"
				>
					Cancelar
				</a>
			</div>
		</form>
	</div>
</div>

<style>
	/* Additional custom styles if needed */
</style>
