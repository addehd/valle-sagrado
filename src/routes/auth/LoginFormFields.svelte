<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { isModal = false, onSuccess = () => {} }: { isModal?: boolean; onSuccess?: () => void } = $props();
	
	let isSubmitting = $state(false);
</script>

	<form 
		class="space-y-4 md:space-y-6" 
		method="post" 
		action="/auth?/login"
		onsubmit={() => console.log('[LoginForm] Form onsubmit fired')}
	use:enhance={() => {
		isSubmitting = true;
		console.log('[LoginForm] Submitting login form');
		return async ({ result, update }) => {
			isSubmitting = false;
			console.log('[LoginForm] Form submission result:', result.type);
			
			// If we're in a modal and login was successful
			if (isModal && (result.type === 'redirect' || result.type === 'success')) {
				console.log('[LoginForm] Modal success - closing modal');
				// Trigger the success callback which will close modal and reload
				onSuccess();
				return; // Don't do the default redirect
			}
			
			// For full page, allow normal redirect
			console.log('[LoginForm] Full page redirect');
			await update();
		};
	}}
>
	<div>
		<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Email</label>
		<input 
			type="email" 
			name="email" 
			id="email" 
			class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
			placeholder="name@email.com" 
			required
			disabled={isSubmitting}
		/>
	</div>
	<div>
		<label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
		<input 
			type="password" 
			name="password" 
			id="password" 
			placeholder="••••••••" 
			class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
			required
			disabled={isSubmitting}
		/>
	</div>
	<div class="flex items-center justify-between">
		<div class="flex items-start">
			<div class="flex items-center h-5">
				<input 
					id="remember" 
					aria-describedby="remember" 
					type="checkbox" 
					checked 
					class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
					disabled={isSubmitting}
				/>
			</div>
			<div class="ml-3 text-sm">
				<label for="remember" class="text-gray-500 dark:text-gray-300">Remember me</label>
			</div>
		</div>
		<a href="/forgot-password" class="text-sm font-medium text-primary-600 hover:underline dark:text-white">Forgot password?</a>
	</div>
	<button 
		type="submit" 
		disabled={isSubmitting}
		onclick={() => console.log('[LoginForm] Button clicked')}
		class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
	>
		{isSubmitting ? 'Loggar in...' : 'Fortsätt'}
	</button>
	<p class="text-sm font-light text-center text-gray-500 dark:text-gray-300">
		<a href="/" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Don't have an account?</a>
	</p>
</form>
