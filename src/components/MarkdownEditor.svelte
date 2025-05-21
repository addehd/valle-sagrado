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

<div bind:this={editorElement} class="w-full h-full min-h-[200px] border border-gray-300 rounded-lg bg-white" /> 