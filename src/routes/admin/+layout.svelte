<script lang="ts">
	import { page } from '$app/stores';
	import { isAdmin, isSuperAdmin, getAdminUser } from '$lib/admin';
	
	export let data;
	
	$: user = data.user;
	$: project = data.project;
	$: adminUser = getAdminUser(user);
	$: userRole = user?.app_metadata?.role || 'user';
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Admin Header -->
	<header class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-4">
				<div class="flex items-center space-x-4">
					<a href="/admin" class="flex items-center space-x-2">
						<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="flex flex-col">
							<span class="text-xl font-semibold text-gray-900">Admin Panel</span>
							{#if project}
								<span class="text-sm text-gray-600">{project.name}</span>
							{/if}
						</div>
					</a>
					
					<!-- Role Badge -->
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {userRole === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
						{userRole === 'super_admin' ? 'Super Admin' : 'Admin'}
					</span>
				</div>
				
				<div class="flex items-center space-x-4">
					<!-- User Info -->
					<div class="text-sm text-gray-600">
						{user?.email}
					</div>
					
					<!-- Navigation Links -->
					<nav class="flex space-x-4">
						<a href="/admin" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium {$page.url.pathname === '/admin' ? 'bg-gray-100 text-gray-900' : ''}">
							Dashboard
						</a>
						<a href="/admin/products" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium {$page.url.pathname.startsWith('/admin/products') ? 'bg-gray-100 text-gray-900' : ''}">
							Products
						</a>
						<a href="/admin/orders" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium {$page.url.pathname.startsWith('/admin/orders') ? 'bg-gray-100 text-gray-900' : ''}">
							Orders
						</a>
						{#if isSuperAdmin(user)}
							<a href="/admin/users" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium {$page.url.pathname.startsWith('/admin/users') ? 'bg-gray-100 text-gray-900' : ''}">
								Users
							</a>
						{/if}
						
						<!-- View Store Link -->
						{#if project}
							<a href="/{project.url}" target="_blank" class="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
								<span>View Store</span>
							</a>
						{/if}
					</nav>
					
					<!-- Exit Admin -->
					<a href="/" class="text-gray-400 hover:text-gray-600" aria-label="Exit admin panel">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
						</svg>
					</a>
				</div>
			</div>
		</div>
	</header>
	
	<!-- Main Content -->
	<main>
		<slot />
	</main>
</div> 