<script lang="ts">
	import { page } from '$app/stores';
	
	const email = $derived($page.url.searchParams.get('email') || '');
</script>

<section class="bg-[url('/images/valle.jpg')] bg-no-repeat bg-cover bg-center bg-gray-900/70 bg-blend-multiply">
	<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen pt:mt-0">
		<div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-900">
			<div class="p-6 space-y-4 md:space-y-6 lg:space-y-8 sm:p-8">
				<div class="text-center">
					<svg class="mx-auto mb-4 w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
					<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-2">
						E-post skickad!
					</h1>
					<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
						{#if email}
							Vi har skickat en återställningslänk till <strong>{email}</strong>
						{:else}
							Vi har skickat en återställningslänk till din e-postadress
						{/if}
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">
						Kontrollera din inkorg och klicka på länken för att återställa ditt lösenord. 
						Om du inte ser e-postmeddelandet, kontrollera din skräppostmapp.
					</p>
				</div>
				
				<a 
					href="/auth" 
					class="block w-full text-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
					Tillbaka till inloggning
				</a>
			</div>
		</div>
	</div>
</section>
