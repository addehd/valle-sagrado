<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	
	let isSubmitting = $state(false);
	let { data, form }: { data?: { email?: string }; form?: { error?: string } } = $props();
	
	const token = $derived($page.url.searchParams.get('token'));
</script>

<section class="bg-[url('/images/valle.jpg')] bg-no-repeat bg-cover bg-center bg-gray-900/70 bg-blend-multiply">
	<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen pt:mt-0">
		<div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-900">
			<div class="p-6 space-y-4 md:space-y-6 lg:space-y-8 sm:p-8">
				<h1 class="text-xl font-bold leading-tight tracking-tight text-center text-gray-900 md:text-2xl dark:text-white">
					Återställ lösenord
				</h1>
				
				{#if data?.email}
					<p class="text-sm text-center text-gray-600 dark:text-gray-400">
						Ange ett nytt lösenord för <strong>{data.email}</strong>
					</p>
				{/if}
				
				{#if form?.error}
					<div class="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900/50 dark:text-red-400" role="alert">
						{form.error}
					</div>
				{/if}

				<form 
					method="post" 
					action="?/resetPassword"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							await update();
						};
					}}
					class="space-y-4 md:space-y-6">
					<div>
						<label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
							Nytt lösenord
						</label>
						<input 
							type="password" 
							name="password" 
							id="password" 
							placeholder="••••••••" 
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
							required
							minlength="6"
							disabled={isSubmitting}
						/>
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Minst 6 tecken
						</p>
					</div>
					
					<div>
						<label for="confirmPassword" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
							Bekräfta lösenord
						</label>
						<input 
							type="password" 
							name="confirmPassword" 
							id="confirmPassword" 
							placeholder="••••••••" 
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
							required
							minlength="6"
							disabled={isSubmitting}
						/>
					</div>
					
					<button 
						type="submit" 
						disabled={isSubmitting}
						class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed">
						{isSubmitting ? 'Återställer...' : 'Återställ lösenord'}
					</button>
					
					<p class="text-sm font-light text-center text-gray-500 dark:text-gray-300">
						<a href="/auth" class="font-medium text-primary-600 hover:underline dark:text-primary-500">
							Tillbaka till inloggning
						</a>
					</p>
				</form>
			</div>
		</div>
	</div>
</section>
