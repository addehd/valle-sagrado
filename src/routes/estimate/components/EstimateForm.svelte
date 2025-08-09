<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let editingEstimate: any = null;
	export let loading = false;
	
	const dispatch = createEventDispatcher();
	
	let title = editingEstimate?.title || '';
	let serviceName = editingEstimate?.service_name || '';
	let description = editingEstimate?.description || '';
	let hourlyRate = editingEstimate?.hourly_rate || '';
	let estimatedHours = editingEstimate?.estimated_hours || '';
	let notes = editingEstimate?.notes || '';
	let status = editingEstimate?.status || 'draft';
	let isCompleted = editingEstimate?.is_completed || false;
	
	// Update form when editingEstimate changes
	$: if (editingEstimate) {
		title = editingEstimate.title || '';
		serviceName = editingEstimate.service_name || '';
		description = editingEstimate.description || '';
		hourlyRate = editingEstimate.hourly_rate || '';
		estimatedHours = editingEstimate.estimated_hours || '';
		notes = editingEstimate.notes || '';
		status = editingEstimate.status || 'draft';
		isCompleted = editingEstimate.is_completed || false;
	}
	
	$: totalCost = (parseFloat(hourlyRate) || 0) * (parseFloat(estimatedHours) || 0);
	
	function handleCancel() {
		dispatch('cancel');
	}
	
	function handleSuccess() {
		dispatch('success');
	}
</script>

<div class="bg-gray-50 dark:bg-neutral-700 p-6 rounded-lg border border-gray-200 dark:border-neutral-600">
	<h3 class="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-4">
		{editingEstimate ? 'Edit Estimate' : 'Create New Estimate'}
	</h3>
	
	<form method="POST" action={editingEstimate ? '?/update' : '?/create'} class="space-y-4">
		{#if editingEstimate}
			<input type="hidden" name="id" value={editingEstimate.id} />
		{/if}
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="title" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
					Title *
				</label>
				<input
					type="text"
					id="title"
					name="title"
					bind:value={title}
					required
					class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
					placeholder="Project title"
				/>
			</div>
			
			<div>
				<label for="service_name" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
					Service Name *
				</label>
				<input
					type="text"
					id="service_name"
					name="service_name"
					bind:value={serviceName}
					required
					class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
					placeholder="Service or task name"
				/>
			</div>
		</div>
		
		<div>
			<label for="description" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
				Description
			</label>
			<textarea
				id="description"
				name="description"
				bind:value={description}
				rows="3"
				class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
				placeholder="Brief description of the work"
			></textarea>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label for="hourly_rate" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
					Hourly Rate (SEK) *
				</label>
				<input
					type="number"
					id="hourly_rate"
					name="hourly_rate"
					bind:value={hourlyRate}
					required
					min="0"
					step="0.01"
					class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
					placeholder="1000.00"
				/>
			</div>
			
			<div>
				<label for="estimated_hours" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
					Estimated Hours *
				</label>
				<input
					type="number"
					id="estimated_hours"
					name="estimated_hours"
					bind:value={estimatedHours}
					required
					min="0"
					step="0.5"
					class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
					placeholder="8.0"
				/>
			</div>
			
			<div>
				<label for="total_cost" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
					Total Cost
				</label>
				<div id="total_cost" class="w-full px-3 py-2 bg-gray-100 dark:bg-neutral-600 border border-gray-300 dark:border-neutral-500 rounded-md text-gray-900 dark:text-neutral-100 font-medium">
					{totalCost.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}
				</div>
			</div>
		</div>
		
		{#if editingEstimate}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
						Status
					</label>
					<select
						id="status"
						name="status"
						bind:value={status}
						class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
					>
						<option value="draft">Draft</option>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="completed">Completed</option>
						<option value="cancelled">Cancelled</option>
					</select>
				</div>
				
				<div class="flex items-center pt-6">
					<input
						type="checkbox"
						id="is_completed"
						name="is_completed"
						bind:checked={isCompleted}
						class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-neutral-600 rounded"
					/>
					<label for="is_completed" class="ml-2 block text-sm text-gray-700 dark:text-neutral-300">
						Mark as completed
					</label>
				</div>
			</div>
		{/if}
		
		<div>
			<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
				Notes
			</label>
			<textarea
				id="notes"
				name="notes"
				bind:value={notes}
				rows="3"
				class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
				placeholder="Additional notes or requirements"
			></textarea>
		</div>
		
		<div class="flex justify-end space-x-3 pt-4">
			<button
				type="button"
				on:click={handleCancel}
				class="px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={loading}
				class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
			>
				{loading ? 'Saving...' : (editingEstimate ? 'Update Estimate' : 'Create Estimate')}
			</button>
		</div>
	</form>
</div>