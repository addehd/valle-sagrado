<script lang="ts">
  import { onMount } from 'svelte';

  // props using runes - uploadEndpoint allows passing a custom upload action URL
  let {
    value = '',
    onChange = () => {},
    uploadEndpoint = '/api/upload-markdown-image',
    pageId = ''
  }: { value?: string; onChange?: (value: string) => void; uploadEndpoint?: string; pageId?: string } = $props();

  let textareaElement = $state<HTMLTextAreaElement>();
  let localValue = $state(value);
  let fileInputElement = $state<HTMLInputElement>();
  let isUploading = $state(false);
  let uploadError = $state<string | null>(null);
  type HistoryEntry = { value: string; selectionStart: number; selectionEnd: number };
  let history = $state<HistoryEntry[]>([
    { value, selectionStart: value.length, selectionEnd: value.length }
  ]);
  let historyIndex = $state(0);

  function pushHistory(nextValue: string, selectionStart?: number, selectionEnd?: number) {
    const start = selectionStart ?? textareaElement?.selectionStart ?? nextValue.length;
    const end = selectionEnd ?? textareaElement?.selectionEnd ?? start;
    const current = history[historyIndex];

    if (current && current.value === nextValue && current.selectionStart === start && current.selectionEnd === end) {
      return;
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ value: nextValue, selectionStart: start, selectionEnd: end });
    history = newHistory;
    historyIndex = newHistory.length - 1;
  }

  function applyHistory(entry: HistoryEntry) {
    localValue = entry.value;
    onChange(entry.value);

    setTimeout(() => {
      if (!textareaElement) return;
      textareaElement.focus();
      textareaElement.setSelectionRange(entry.selectionStart, entry.selectionEnd);
    }, 0);
  }

  function handleUndoRedo(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const isMetaOrCtrl = event.metaKey || event.ctrlKey;
    const isUndo = isMetaOrCtrl && !event.shiftKey && key === 'z';
    const isRedo = isMetaOrCtrl && ((event.shiftKey && key === 'z') || key === 'y');

    if (isUndo) {
      if (historyIndex > 0) {
        event.preventDefault();
        historyIndex -= 1;
        applyHistory(history[historyIndex]);
      }
    } else if (isRedo) {
      if (historyIndex < history.length - 1) {
        event.preventDefault();
        historyIndex += 1;
        applyHistory(history[historyIndex]);
      }
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    localValue = target.value;
    onChange(target.value);
    pushHistory(target.value, target.selectionStart, target.selectionEnd);
  }

  // sync local value with prop changes
  $effect(() => {
    if (value !== history[historyIndex]?.value) {
      localValue = value;
      pushHistory(value, value.length, value.length);
    }
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
    pushHistory(newText, start + before.length + selected.length + after.length);
    
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
      console.log('=============================================');
      console.log('📸 MARKDOWN EDITOR: Image Upload Started');
      console.log('=============================================');
      console.log('📸 Image selected:', file.name, file.size, file.type);
      console.log('📋 uploadEndpoint prop:', uploadEndpoint);
      console.log('📋 pageId prop:', pageId);

      // Use form action (same approach as regular form)
      const formData = new FormData();
      formData.append('file', file);
      if (pageId) {
        formData.append('pageId', pageId);
      }

      console.log('📤 uploadEndpoint value:', uploadEndpoint);

      // Resolve endpoint/action: if caller passed `?/action`, post to current page with that action
      let endpoint = uploadEndpoint;
      let actionName = 'uploadImage';

      if (uploadEndpoint?.startsWith('?/')) {
        actionName = uploadEndpoint.slice(2) || 'uploadImage';
        endpoint = typeof window !== 'undefined' ? window.location.pathname : '';
      } else if (!uploadEndpoint) {
        endpoint = typeof window !== 'undefined' ? window.location.pathname : '';
      }

      console.log('=============================================');
      console.log('🚀 SENDING REQUEST TO:', endpoint);
      console.log('📍 Full URL:', typeof window !== 'undefined' ? new URL(endpoint, window.location.origin).href : endpoint);
      console.log('📍 Action name:', actionName);
      console.log('=============================================');

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        // Ensure SvelteKit routes this request to the named form action
        headers: {
          'accept': 'application/json',
          'x-sveltekit-action': actionName
        },
        credentials: 'include'
      });

      console.log('=============================================');
      console.log('📥 RESPONSE RECEIVED');
      console.log('=============================================');
      console.log('📥 Response status:', response.status);
      console.log('📥 Content-Type:', response.headers.get('content-type'));

      const text = await response.text();
      console.log('📥 Raw response (first 300 chars):', text.substring(0, 300));

      if (!response.ok) {
        console.error('❌ Server returned error status:', response.status);
        throw new Error(`Server error: ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(text);
        console.log('📦 Parsed response:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        console.error('Response was:', text);
        throw new Error('Invalid response from server');
      }

      // Handle SvelteKit form action response format
      const data = result.type === 'success' ? result.data : result;

      if (!data.success) {
        throw new Error(data.message || 'Error al subir la imagen');
      }

      // Insert image markdown with the URL from server
      const imageUrl = data.url;
      const imageName = data.fileName || file.name;
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

<div class="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
  <div class="flex flex-wrap gap-2 border-b border-gray-200 bg-gray-50 p-2 sm:p-3">
    <div class="flex gap-1 border-r border-gray-300 pr-2 last:border-r-0">
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Encabezado 1"
        onclick={() => insertHeader(1)}>
        H1
      </button>
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Encabezado 2"
        onclick={() => insertHeader(2)}>
        H2
      </button>
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Encabezado 3"
        onclick={() => insertHeader(3)}>
        H3
      </button>
    </div>
    <div class="flex gap-1 border-r border-gray-300 pr-2 last:border-r-0">
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Negrita"
        onclick={insertBold}>
        <strong>B</strong>
      </button>
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Cursiva"
        onclick={insertItalic}>
        <em>I</em>
      </button>
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Código"
        onclick={insertCode}>{"<>"}</button>
    </div>
    <div class="flex gap-1 border-r border-gray-300 pr-2 last:border-r-0">
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Lista"
        onclick={insertList}>• Lista</button>
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Lista numerada"
        onclick={insertNumberedList}>1. Lista</button>
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Cita"
        onclick={insertQuote}>❝ Cita</button>
    </div>
    <div class="flex gap-1 border-r border-gray-300 pr-2 last:border-r-0">
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Enlace"
        onclick={insertLink}>🔗 Enlace</button>
      <button
        type="button"
        class="whitespace-nowrap rounded-md border border-transparent bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-gray-300 hover:bg-gray-200 active:translate-y-0 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
        title="Subir imagen"
        onclick={triggerImageUpload}
        disabled={isUploading}>
        {#if isUploading}
          ⏳ Subiendo...
        {:else}
          🖼️ Imagen
        {/if}
      </button>
    </div>
  </div>

  <input
    bind:this={fileInputElement}
    type="file"
    accept="image/*"
    onchange={handleImageUpload}
    class="hidden" />

  {#if uploadError}
    <div class="border-b border-red-300 bg-red-100 px-3 py-2 text-sm font-medium text-red-600">
      ⚠️ {uploadError}
    </div>
  {/if}
  <textarea
    bind:this={textareaElement}
    bind:value={localValue}
    oninput={handleInput}
    onkeydown={handleUndoRedo}
    class="w-full min-h-[200px] resize-y border-none bg-white p-3 font-sans text-sm leading-relaxed outline-none placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-500 sm:min-h-[60vh] sm:p-4"
    placeholder="Escribe la información del proyecto en formato markdown..."></textarea>
</div>