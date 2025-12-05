<script lang="ts">
  import { onMount } from 'svelte';

  // props using runes - uploadEndpoint allows passing a custom upload API URL
  let { value = '', onChange = () => {}, uploadEndpoint = '/api/upload-markdown-image' }: { value?: string; onChange?: (value: string) => void; uploadEndpoint?: string } = $props();

  let textareaElement = $state<HTMLTextAreaElement>();
  let localValue = $state(value);
  let fileInputElement = $state<HTMLInputElement>();
  let isUploading = $state(false);
  let uploadError = $state<string | null>(null);

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    localValue = target.value;
    onChange(target.value);
  }

  // sync local value with prop changes
  $effect(() => {
    localValue = value;
  });

  onMount(() => {
    if (textareaElement && value) {
      textareaElement.value = value;
    }
  });

  function insertAtCursor(before: string, after = '') {
    if (!textareaElement) return;
    
    const start = textareaElement.selectionStart;
    const end = textareaElement.selectionEnd;
    const text = textareaElement.value;
    const selected = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    
    localValue = newText;
    onChange(newText);
    
    // Set cursor position after the inserted text
    const newCursorPos = start + before.length + selected.length + after.length;
    
    // Use timeout to ensure the textarea is updated
    setTimeout(() => {
      if (textareaElement) {
        textareaElement.focus();
        textareaElement.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }

  function insertHeader(level: number) {
    const headerPrefix = '#'.repeat(level) + ' ';
    insertAtCursor(headerPrefix);
  }

  function insertBold() {
    insertAtCursor('**', '**');
  }

  function insertItalic() {
    insertAtCursor('*', '*');
  }

  function insertLink() {
    if (!textareaElement) return;
    
    const start = textareaElement.selectionStart;
    const end = textareaElement.selectionEnd;
    const selected = textareaElement.value.substring(start, end);
    
    if (selected) {
      insertAtCursor(`[${selected}](`, ')');
    } else {
      insertAtCursor('[texto del enlace](', ')');
    }
  }

  function insertList() {
    insertAtCursor('- ');
  }

  function insertNumberedList() {
    insertAtCursor('1. ');
  }

  function insertQuote() {
    insertAtCursor('> ');
  }

  function insertCode() {
    insertAtCursor('`', '`');
  }

  function triggerImageUpload() {
    fileInputElement?.click();
  }

  async function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      uploadError = 'Por favor selecciona un archivo de imagen válido';
      setTimeout(() => uploadError = null, 3000);
      return;
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      uploadError = 'La imagen es demasiado grande. Máximo 5MB';
      setTimeout(() => uploadError = null, 3000);
      return;
    }

    isUploading = true;
    uploadError = null;

    try {
      // #region agent log
      const logStart = {location:'MarkdownEditor.svelte:handleImageUpload',message:'Starting server-side upload',data:{fileName:file.name,fileSize:file.size,uploadEndpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix'};
      console.log('[DEBUG-UPLOAD-START]', JSON.stringify(logStart));
      // #endregion

      // Use API endpoint for upload (has proper auth context)
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      // #region agent log
      const logResponse = {location:'MarkdownEditor.svelte:afterFetch',message:'Server response received',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix'};
      console.log('[DEBUG-UPLOAD-RESPONSE]', JSON.stringify(logResponse));
      // #endregion

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      const result = await response.json();
      
      // #region agent log
      const logResult = {location:'MarkdownEditor.svelte:parsedResult',message:'Parsed server result',data:{success:result.success,hasUrl:!!result.url,error:result.message||null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix'};
      console.log('[DEBUG-UPLOAD-RESULT]', JSON.stringify(logResult));
      // #endregion

      if (!result.success) {
        throw new Error(result.message || 'Error al subir la imagen');
      }

      // Insert image markdown with the URL from server
      const imageUrl = result.url;
      const imageName = result.fileName || file.name;
      const imageMarkdown = `![${imageName}](${imageUrl})`;
      insertAtCursor(imageMarkdown);

    } catch (error) {
      console.error('Error uploading image:', error);
      uploadError = error instanceof Error ? error.message : 'Error al subir la imagen';
      setTimeout(() => uploadError = null, 5000);
    } finally {
      isUploading = false;
      // Reset file input
      if (target) target.value = '';
    }
  }
</script>

<div class="markdown-editor">
  <div class="toolbar">
    <div class="toolbar-group">
      <button type="button" class="toolbar-btn" title="Encabezado 1" onclick={() => insertHeader(1)}>H1</button>
      <button type="button" class="toolbar-btn" title="Encabezado 2" onclick={() => insertHeader(2)}>H2</button>
      <button type="button" class="toolbar-btn" title="Encabezado 3" onclick={() => insertHeader(3)}>H3</button>
    </div>
    <div class="toolbar-group">
      <button type="button" class="toolbar-btn" title="Negrita" onclick={insertBold}><strong>B</strong></button>
      <button type="button" class="toolbar-btn" title="Cursiva" onclick={insertItalic}><em>I</em></button>
      <button type="button" class="toolbar-btn" title="Código" onclick={insertCode}>{"<>"}</button>
    </div>
    <div class="toolbar-group">
      <button type="button" class="toolbar-btn" title="Lista" onclick={insertList}>• Lista</button>
      <button type="button" class="toolbar-btn" title="Lista numerada" onclick={insertNumberedList}>1. Lista</button>
      <button type="button" class="toolbar-btn" title="Cita" onclick={insertQuote}>❝ Cita</button>
    </div>
    <div class="toolbar-group">
      <button type="button" class="toolbar-btn" title="Enlace" onclick={insertLink}>🔗 Enlace</button>
      <button 
        type="button" 
        class="toolbar-btn" 
        title="Subir imagen" 
        onclick={triggerImageUpload}
        disabled={isUploading}
      >
        {#if isUploading}
          ⏳ Subiendo...
        {:else}
          🖼️ Imagen
        {/if}
      </button>
    </div>
  </div>
  
  <!-- Hidden file input for image upload -->
  <input 
    bind:this={fileInputElement}
    type="file" 
    accept="image/*"
    onchange={handleImageUpload}
    style="display: none;"
  />
  
  <!-- Upload error message -->
  {#if uploadError}
    <div class="upload-error">
      ⚠️ {uploadError}
    </div>
  {/if}
  <textarea 
    bind:this={textareaElement}
    bind:value={localValue}
    oninput={handleInput}
    class="editor-content"
    placeholder="Escribe la información del proyecto en formato markdown..."
  ></textarea>
</div>

<style>
  .markdown-editor {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: white;
    overflow: hidden;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    background-color: #f9fafb;
  }

  .toolbar-group {
    display: flex;
    gap: 0.25rem;
    padding-right: 0.5rem;
    border-right: 1px solid #d1d5db;
  }

  .toolbar-group:last-child {
    border-right: none;
  }

  .toolbar-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    color: #374151;
    font-weight: 500;
  }

  .toolbar-btn:hover {
    background-color: #e5e7eb;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }

  .toolbar-btn:active {
    transform: translateY(0);
    background-color: #d1d5db;
  }

  .toolbar-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .upload-error {
    padding: 0.5rem 0.75rem;
    background-color: #fee2e2;
    border-bottom: 1px solid #fca5a5;
    color: #dc2626;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .editor-content {
    width: 100%;
    min-height: 250px;
    padding: 1rem;
    border: none;
    outline: none;
    resize: vertical;
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 0.875rem;
    line-height: 1.6;
    background-color: white;
  }

  .editor-content::placeholder {
    color: #9ca3af;
  }

  .editor-content:focus {
    box-shadow: inset 0 0 0 1px #3b82f6;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .toolbar {
      padding: 0.5rem;
    }
    
    .toolbar-btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
    
    .editor-content {
      min-height: 200px;
      padding: 0.75rem;
    }
  }
</style> 