<script lang="ts">
  import { Editor, rootCtx, defaultValueCtx } from "@milkdown/kit/core";
  import { commonmark } from "@milkdown/kit/preset/commonmark";
  import { nord } from "@milkdown/theme-nord";
  import { onMount } from 'svelte';

  // props

  export let value = '';
  export let onChange: (value: string) => void = () => {};

  let editorElement: HTMLElement;
  let editor: Editor;

  onMount(() => {
    editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, editorElement);
        ctx.set(defaultValueCtx, value);
      })
      .config(nord)
      .use(commonmark)
      .create();

    editor.then((ed) => {
      ed.action((ctx) => {
        const listener = ctx.get(listenerCtx);
        listener.listen((ctx) => {
          const content = ctx.get(editorStateCtx).doc.toString();
          onChange(content);
        });
      });
    });

    return () => {
      editor.then((ed) => ed.destroy());
    };
  });
</script>

<div class="markdown-editor">
  <div class="toolbar">
    <div class="toolbar-group">
      <button class="toolbar-btn" title="h1">H1</button>
      <button class="toolbar-btn" title="h2">H2</button>
      <button class="toolbar-btn" title="h3">H3</button>
    </div>
    <div class="toolbar-group">
      <button class="toolbar-btn" title="bold">B</button>
      <button class="toolbar-btn" title="italic">I</button>
      <button class="toolbar-btn" title="link">🔗</button>
    </div>
  </div>
  <div bind:this={editorElement} class="editor-content" />
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
  }

  /* milkdown specific styles */
  :global(.milkdown) {
    max-width: none;
  }
</style> 