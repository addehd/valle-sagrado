<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	
	let isSubmitting = $state(false);
	let password = $state('');
	let confirmPassword = $state('');
	let passwordsMatch = $derived(password === confirmPassword);
</script>

<section class="bg-gray-50 dark:bg-gray-900">
	<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
		<div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
			<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
				<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
					Update your password
				</h1>
				
				<form 
					class="space-y-4 md:space-y-6" 
					method="post"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								await goto('/auth');
							}
							await update();
						};
					}}>
					<div>
						<label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
							New password
						</label>
						<input 
							type="password" 
							name="password" 
							id="password" 
							bind:value={password}
							placeholder="••••••••" 
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
							required
							minlength="6"
							disabled={isSubmitting} />
					</div>
					
					<div>
						<label for="confirmPassword" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
							Confirm new password
						</label>
						<input 
							type="password" 
							name="confirmPassword" 
							id="confirmPassword" 
							bind:value={confirmPassword}
							placeholder="••••••••" 
							class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
							required
							minlength="6"
							disabled={isSubmitting} />
						{#if confirmPassword && !passwordsMatch}
							<p class="mt-2 text-sm text-red-600 dark:text-red-500">Passwords do not match</p>
						{/if}
					</div>
					
					<button 
						type="submit" 
						disabled={isSubmitting || !passwordsMatch || !password}
						class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed">
						{isSubmitting ? 'Updating...' : 'Update password'}
					</button>
				</form>
			</div>
		</div>
	</div>
</section>
