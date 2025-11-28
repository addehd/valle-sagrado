<script lang="ts">
	import { enhance } from '$app/forms';
	
	let isSubmitting = $state(false);
	let emailSent = $state(false);
</script>

<section class="bg-gray-50 dark:bg-gray-900">
	<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
		<div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
			<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
				<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
					Reset your password
				</h1>
				
				{#if emailSent}
					<div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
						<p class="font-medium">Check your email!</p>
						<p class="mt-2">We've sent you a password reset link. Please check your email and click the link to reset your password.</p>
					</div>
					<div class="text-center">
						<a href="/auth" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
							Back to login
						</a>
					</div>
				{:else}
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Enter your email address and we'll send you a link to reset your password.
					</p>
					
					<form 
						class="space-y-4 md:space-y-6" 
						method="post"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									emailSent = true;
								}
								await update();
							};
						}}>
						<div>
							<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
								Your email
							</label>
							<input 
								type="email" 
								name="email" 
								id="email" 
								class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
								placeholder="name@email.com" 
								required
								disabled={isSubmitting} />
						</div>
						
						<button 
							type="submit" 
							disabled={isSubmitting}
							class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed">
							{isSubmitting ? 'Sending...' : 'Send reset link'}
						</button>
						
						<p class="text-sm font-light text-center text-gray-500 dark:text-gray-300">
							Remember your password? 
							<a href="/auth" class="font-medium text-primary-600 hover:underline dark:text-primary-500">
								Back to login
							</a>
						</p>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>
