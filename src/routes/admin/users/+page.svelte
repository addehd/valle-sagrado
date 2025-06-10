<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let users: any[] = [];
	let loading = true;
	let error = '';
	let selectedUser: any = null;
	let showRoleModal = false;
	let newRole = '';
	let updating = false;

	const roleLabels = {
		user: 'User',
		admin: 'Admin',
		super_admin: 'Super Admin'
	};

	const roleBadgeClasses = {
		user: 'bg-gray-100 text-gray-800',
		admin: 'bg-blue-100 text-blue-800',
		super_admin: 'bg-purple-100 text-purple-800'
	};

	async function loadUsers() {
		try {
			loading = true;
			error = '';
			
			const response = await fetch('/api/admin/users?type=admins');
			
			if (response.ok) {
				users = await response.json();
			} else {
				const errorData = await response.json();
				error = errorData.error || 'Failed to load users';
			}
		} catch (err) {
			console.error('Error loading users:', err);
			error = 'Failed to load users';
		} finally {
			loading = false;
		}
	}

	function openRoleModal(user: any) {
		selectedUser = user;
		newRole = user.app_metadata?.role || 'user';
		showRoleModal = true;
	}

	function closeRoleModal() {
		selectedUser = null;
		newRole = '';
		showRoleModal = false;
	}

	async function updateUserRole() {
		if (!selectedUser || !newRole) return;

		try {
			updating = true;
			
			const response = await fetch('/api/admin/users', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId: selectedUser.id,
					role: newRole
				})
			});

			if (response.ok) {
				// Update the user in the local array
				const userIndex = users.findIndex(u => u.id === selectedUser.id);
				if (userIndex !== -1) {
					users[userIndex] = {
						...users[userIndex],
						app_metadata: {
							...users[userIndex].app_metadata,
							role: newRole
						}
					};
					users = users; // Trigger reactivity
				}
				
				closeRoleModal();
			} else {
				const errorData = await response.json();
				error = errorData.error || 'Failed to update user role';
			}
		} catch (err) {
			console.error('Error updating user role:', err);
			error = 'Failed to update user role';
		} finally {
			updating = false;
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	onMount(() => {
		loadUsers();
	});
</script>

<svelte:head>
	<title>Users - Admin Panel</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Users</h1>
				<p class="mt-2 text-gray-600">Manage user accounts and permissions</p>
			</div>
			
			<button 
				on:click={loadUsers}
				class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				<span>Refresh</span>
			</button>
		</div>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<span class="ml-2 text-gray-600">Loading users...</span>
		</div>
	
	<!-- Error State -->
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800">Error</h3>
					<div class="mt-2 text-sm text-red-700">
						{error}
					</div>
				</div>
			</div>
		</div>

	<!-- Users List -->
	{:else if users.length === 0}
		<div class="text-center py-12">
			<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900">No admin users found</h3>
			<p class="mt-1 text-sm text-gray-500">No users with admin privileges were found in the system.</p>
		</div>
	
	{:else}
		<!-- Users Table -->
		<div class="bg-white shadow-sm rounded-lg overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								User
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Role
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Last Sign In
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Created
							</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each users as user (user.id)}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="flex-shrink-0 h-10 w-10">
											<div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
												<svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
											</div>
										</div>
										<div class="ml-4">
											<div class="text-sm font-medium text-gray-900">
												{user.email}
											</div>
											<div class="text-sm text-gray-500">
												{user.id}
											</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {roleBadgeClasses[user.app_metadata?.role || 'user']}">
										{roleLabels[user.app_metadata?.role || 'user']}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatDate(user.created_at)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										on:click={() => openRoleModal(user)}
										class="text-blue-600 hover:text-blue-900 transition-colors"
									>
										Change Role
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- Role Change Modal -->
{#if showRoleModal && selectedUser}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
			<!-- Background overlay -->
			<div class="fixed inset-0 transition-opacity" aria-hidden="true">
				<div class="absolute inset-0 bg-gray-500 opacity-75"></div>
			</div>

			<!-- Modal panel -->
			<div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<div class="sm:flex sm:items-start">
						<div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
							<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
							<h3 class="text-lg leading-6 font-medium text-gray-900">
								Change User Role
							</h3>
							<div class="mt-2">
								<p class="text-sm text-gray-500">
									Update the role for {selectedUser.email}
								</p>
							</div>
							<div class="mt-4">
								<label class="block text-sm font-medium text-gray-700 mb-2">
									Select Role
								</label>
								<select 
									bind:value={newRole}
									class="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
								>
									<option value="user">User</option>
									<option value="admin">Admin</option>
									<option value="super_admin">Super Admin</option>
								</select>
							</div>
						</div>
					</div>
				</div>
				<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
					<button
						on:click={updateUserRole}
						disabled={updating}
						class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
					>
						{#if updating}
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Updating...
						{:else}
							Update Role
						{/if}
					</button>
					<button
						on:click={closeRoleModal}
						disabled={updating}
						class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if} 