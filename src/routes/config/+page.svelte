<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	const { data, form }: Props = $props();

	let showCreateForm = $state(false);
	let editingConfig = $state<any>(null);
	let isSubmitting = $state(false);

	// Form state
	let createName = $state('');
	let createLatitude = $state('');
	let createLongitude = $state('');
	let createZoomLevel = $state(15);
	let createDescription = $state('');

	// Reactive access to mapConfigs
	const mapConfigs = $derived(data.mapConfigs || []);

	function resetCreateForm() {
		createName = '';
		createLatitude = '';
		createLongitude = '';
		createZoomLevel = 15;
		createDescription = '';
		showCreateForm = false;
	}

	function startEdit(config: any) {
		editingConfig = { ...config };
	}

	function cancelEdit() {
		editingConfig = null;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}

	function formatCoordinate(coord: number, type: 'lat' | 'lng'): string {
		const direction = type === 'lat' ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
		return `${Math.abs(coord).toFixed(6)}° ${direction}`;
	}
</script>

<svelte:head>
	<title>Map Configuration - Valle Sagrado</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Map Configuration</h1>
			<p class="mt-2 text-gray-600">Manage map display settings and coordinates</p>
		</div>

		<!-- Messages -->
		{#if form?.message}
			<div class="mb-6 p-4 rounded-lg {form.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}">
				{form.message}
			</div>
		{/if}

		{#if data.error}
			<div class="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
				{data.error}
			</div>
		{/if}

		<!-- Create New Config Button -->
		<div class="mb-6">
			<button
				type="button"
				onclick={() => showCreateForm = !showCreateForm}
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				{showCreateForm ? 'Cancel' : 'Add New Map Configuration'}
			</button>
		</div>

		<!-- Create Form -->
		{#if showCreateForm}
			<div class="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Create New Map Configuration</h2>
				
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								resetCreateForm();
								await invalidateAll();
							}
						};
					}}
				>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="create-name" class="block text-sm font-medium text-gray-700">Configuration Name</label>
							<input
								id="create-name"
								name="name"
								type="text"
								bind:value={createName}
								placeholder="e.g., Sacred Valley Main"
								required
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="create-description" class="block text-sm font-medium text-gray-700">Description</label>
							<input
								id="create-description"
								name="description"
								type="text"
								bind:value={createDescription}
								placeholder="Brief description of this location"
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="create-latitude" class="block text-sm font-medium text-gray-700">Latitude</label>
							<input
								id="create-latitude"
								name="map_start_latitude"
								type="number"
								step="0.000001"
								min="-90"
								max="90"
								bind:value={createLatitude}
								placeholder="-13.5170"
								required
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="create-longitude" class="block text-sm font-medium text-gray-700">Longitude</label>
							<input
								id="create-longitude"
								name="map_start_longitude"
								type="number"
								step="0.000001"
								min="-180"
								max="180"
								bind:value={createLongitude}
								placeholder="-71.9785"
								required
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="create-zoom" class="block text-sm font-medium text-gray-700">Zoom Level</label>
							<input
								id="create-zoom"
								name="map_zoom_level"
								type="number"
								min="1"
								max="20"
								bind:value={createZoomLevel}
								required
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="mt-1 text-xs text-gray-500">1 = World view, 20 = Building level</p>
						</div>
					</div>

					<div class="mt-6 flex justify-end space-x-3">
						<button
							type="button"
							onclick={() => resetCreateForm()}
							class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
						>
							{isSubmitting ? 'Creating...' : 'Create Configuration'}
						</button>
					</div>
				</form>
			</div>
		{/if}

		<!-- Map Configurations Table -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
			<div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
				<h2 class="text-lg font-semibold text-gray-900">Map Configurations</h2>
			</div>

			{#if mapConfigs.length === 0}
				<div class="p-6 text-center text-gray-500">
					No map configurations found. Create your first configuration to get started.
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Name
								</th>
								<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Coordinates
								</th>
								<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Zoom Level
								</th>
								<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Created
								</th>
								<th scope="col" class="relative px-6 py-3">
									<span class="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each mapConfigs as config (config.id)}
								{#if editingConfig && editingConfig.id === config.id}
									<!-- Edit Row -->
									<tr class="bg-blue-50">
										<td colspan="6" class="px-6 py-4">
											<form
												method="POST"
												action="?/update"
												use:enhance={() => {
													isSubmitting = true;
													return async ({ result }) => {
														isSubmitting = false;
														if (result.type === 'success') {
															editingConfig = null;
															await invalidateAll();
														}
													};
												}}
											>
												<input type="hidden" name="id" value={config.id} />
												
												<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
													<div>
														<label for="edit-name" class="block text-sm font-medium text-gray-700">Name</label>
														<input
															id="edit-name"
															name="name"
															type="text"
															bind:value={editingConfig.name}
															required
															class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
														/>
													</div>

													<div>
														<label for="edit-latitude" class="block text-sm font-medium text-gray-700">Latitude</label>
														<input
															id="edit-latitude"
															name="map_start_latitude"
															type="number"
															step="0.000001"
															min="-90"
															max="90"
															bind:value={editingConfig.map_start_latitude}
															required
															class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
														/>
													</div>

													<div>
														<label for="edit-longitude" class="block text-sm font-medium text-gray-700">Longitude</label>
														<input
															id="edit-longitude"
															name="map_start_longitude"
															type="number"
															step="0.000001"
															min="-180"
															max="180"
															bind:value={editingConfig.map_start_longitude}
															required
															class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
														/>
													</div>

													<div>
														<label for="edit-zoom" class="block text-sm font-medium text-gray-700">Zoom Level</label>
														<input
															id="edit-zoom"
															name="map_zoom_level"
															type="number"
															min="1"
															max="20"
															bind:value={editingConfig.map_zoom_level}
															required
															class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
														/>
													</div>

													<div>
														<label for="edit-description" class="block text-sm font-medium text-gray-700">Description</label>
														<input
															id="edit-description"
															name="description"
															type="text"
															bind:value={editingConfig.description}
															class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
														/>
													</div>

													<div class="flex items-center">
														<label class="flex items-center">
															<input
																name="is_active"
																type="checkbox"
																bind:checked={editingConfig.is_active}
																class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
															/>
															<span class="ml-2 text-sm text-gray-700">Active</span>
														</label>
													</div>
												</div>

												<div class="mt-4 flex justify-end space-x-3">
													<button
														type="button"
														onclick={() => cancelEdit()}
														class="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
													>
														Cancel
													</button>
													<button
														type="submit"
														disabled={isSubmitting}
														class="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
													>
														{isSubmitting ? 'Saving...' : 'Save Changes'}
													</button>
												</div>
											</form>
										</td>
									</tr>
								{:else}
									<!-- Display Row -->
									<tr class="hover:bg-gray-50">
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="flex items-center">
												<div>
													<div class="text-sm font-medium text-gray-900">{config.name}</div>
													{#if config.description}
														<div class="text-sm text-gray-500">{config.description}</div>
													{/if}
												</div>
											</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="text-sm text-gray-900 font-mono">
												<div>{formatCoordinate(config.map_start_latitude, 'lat')}</div>
												<div>{formatCoordinate(config.map_start_longitude, 'lng')}</div>
											</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{config.map_zoom_level}
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {config.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
												{config.is_active ? 'Active' : 'Inactive'}
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(config.created_at)}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div class="flex space-x-2">
												<!-- Toggle Active Status -->
												<form
													method="POST"
													action="?/toggle_active"
													use:enhance={() => {
														return async ({ result }) => {
															if (result.type === 'success') {
																await invalidateAll();
															}
														};
													}}
												>
													<input type="hidden" name="id" value={config.id} />
													<input type="hidden" name="is_active" value={config.is_active} />
													<button
														type="submit"
														class="text-sm {config.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}"
													>
														{config.is_active ? 'Deactivate' : 'Activate'}
													</button>
												</form>

												<button
													type="button"
													onclick={() => startEdit(config)}
													class="text-blue-600 hover:text-blue-900"
												>
													Edit
												</button>

												<form
													method="POST"
													action="?/delete"
													use:enhance={() => {
														if (!confirm('Are you sure you want to delete this map configuration? This action cannot be undone.')) {
															return;
														}
														return async ({ result }) => {
															if (result.type === 'success') {
																await invalidateAll();
															}
														};
													}}
												>
													<input type="hidden" name="id" value={config.id} />
													<button
														type="submit"
														class="text-red-600 hover:text-red-900"
													>
														Delete
													</button>
												</form>
											</div>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</div> 