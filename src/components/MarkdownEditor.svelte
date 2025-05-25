<script lang="ts">
  import { onMount } from 'svelte';

  // props
  export let value = '';
  export let onChange: (value: string) => void = () => {};

  let textareaElement: HTMLTextAreaElement;

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    onChange(target.value);
  }

  onMount(() => {
    if (textareaElement) {
      textareaElement.value = value;
    }
  });
</script>

<div class="markdown-editor">
  <div class="toolbar">
    <div class="toolbar-group">
      <button type="button" class="toolbar-btn" title="h1">H1</button>
      <button type="button" class="toolbar-btn" title="h2">H2</button>
      <button type="button" class="toolbar-btn" title="h3">H3</button>
    </div>
    <div class="toolbar-group">
      <button type="button" class="toolbar-btn" title="bold">B</button>
      <button type="button" class="toolbar-btn" title="italic">I</button>
      <button type="button" class="toolbar-btn" title="link">🔗</button>
    </div>
  </div>
  <textarea 
    bind:this={textareaElement}
    {value}
    on:input={handleInput}
    class="editor-content"
    placeholder="Escribe la información del proyecto en formato markdown..."
  />
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
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
    background-color: #f9fafb;
  }

  .toolbar-group {
    display: flex;
    gap: 0.25rem;
    border-right: 1px solid #e5e7eb;
    padding-right: 0.5rem;
  }

  .toolbar-group:last-child {
    border-right: none;
  }

  .toolbar-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.25rem;
    border: none;
    background: none;
    cursor: pointer;
  }

  .toolbar-btn:hover {
    background-color: #e5e7eb;
  }

  .editor-content {
    width: 100%;
    min-height: 200px;
    padding: 1rem;
    border: none;
    outline: none;
    resize: vertical;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }
</style> 