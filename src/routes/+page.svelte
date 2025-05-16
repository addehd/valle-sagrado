<script lang="ts">
  let { data } = $props();
  let { brand } = data;

  let { logo_url, colors, name, website_url, description } = brand


</script>

<img src={logo_url} alt={name} />

<h1 class="text-brand-500">Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
