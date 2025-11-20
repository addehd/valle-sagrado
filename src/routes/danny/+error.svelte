<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-black text-white flex items-center justify-center p-6">
	<div class="max-w-2xl text-center">
		<h1 class="text-6xl font-bold mb-4">
			{$page.status}
		</h1>
		<p class="text-2xl mb-8 text-gray-300">
			{$page.error?.message || 'Something went wrong'}
		</p>
		<a 
			href="/danny" 
			class="inline-block bg-yellow-400 text-black px-8 py-3 font-bold hover:bg-yellow-300 transition-colors">
			← Tillbaka hem
		</a>
		
		<!-- Debug info -->
		<div class="mt-12 p-4 bg-gray-900 rounded text-left text-sm">
			<div class="font-bold mb-2">Debug Info:</div>
			<div>URL: {$page.url.pathname}</div>
			<div>Status: {$page.status}</div>
			<div>Error: {JSON.stringify($page.error)}</div>
		</div>
	</div>
</div>

