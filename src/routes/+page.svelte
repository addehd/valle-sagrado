<script lang="ts">
  import MariaPage from './maria/+page.svelte'
  import RikuyPage from './rikuy/+page.svelte'
  import DannyPage from './danny/+page.svelte'

  export let data: any;
</script>

{#if data.isMariaDomain}
  <MariaPage {data} />
{:else if data.isRikuyDomain}
  <RikuyPage {data} />
{:else}
  <DannyPage {data} />
{/if}