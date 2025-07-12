<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Error - Design Your T-Shirt</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
			<div class="text-center">
				<!-- Error Icon -->
				<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
					<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>

				<!-- Error Title -->
				<h1 class="text-2xl font-bold text-gray-900 mb-2">
					Oops! Something went wrong
				</h1>

				<!-- Error Status -->
				<p class="text-lg text-gray-600 mb-4">
					Error {$page.status || 500}
				</p>

				<!-- Error Message -->
				<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
					<p class="text-sm text-red-800">
						{$page.error?.message || 'An unexpected error occurred while loading the design page.'}
					</p>
				</div>

				<!-- Recovery Options -->
				<div class="space-y-3">
					<button 
						on:click={() => window.location.reload()}
						class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
					>
						Try Again
					</button>

					<button 
						on:click={() => goto('/design')}
						class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
					>
						Go to Design Page
					</button>

					<button 
						on:click={() => goto('/')}
						class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
					>
						Go Home
					</button>
				</div>

				<!-- Additional Help -->
				<div class="mt-6 text-center">
					<p class="text-xs text-gray-500">
						If this problem persists, please contact support or try again later.
					</p>
				</div>
			</div>
		</div>
	</div>
</div> 