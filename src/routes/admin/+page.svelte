<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	let stats = {
		totalProducts: 0,
		activeProducts: 0,
		draftProducts: 0,
		totalOrders: 0,
		pendingOrders: 0,
		lowStockAlerts: 0
	};
	
	let loading = true;
	let error = '';
	
	onMount(async () => {
		await loadDashboardStats();
	});
	
	async function loadDashboardStats() {
		try {
			// Load basic stats
			const response = await fetch('/api/admin/dashboard-stats');
			if (response.ok) {
				stats = await response.json();
			}
		} catch (err) {
			console.error('Failed to load dashboard stats:', err);
			error = 'Failed to load dashboard statistics';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard | Valle Sagrado</title>
</svelte:head>

<main class="container mx-auto px-6 py-12 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
		<p class="text-gray-600">Welcome back! Here's what's happening with your store.</p>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
			{error}
		</div>
	{/if}

	<!-- Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-blue-100 text-blue-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
					</svg>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">Total Products</h3>
					<p class="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-green-100 text-green-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">Active Products</h3>
					<p class="text-2xl font-semibold text-gray-900">{stats.activeProducts}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
					<p class="text-2xl font-semibold text-gray-900">{stats.lowStockAlerts}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-purple-100 text-purple-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
					</svg>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">Total Orders</h3>
					<p class="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-orange-100 text-orange-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">Pending Orders</h3>
					<p class="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-gray-100 text-gray-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
					</svg>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">Draft Products</h3>
					<p class="text-2xl font-semibold text-gray-900">{stats.draftProducts}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-lg shadow p-6 mb-8">
		<h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<a href="/create-product" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
				<svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
				</svg>
				<div>
					<h3 class="font-medium text-gray-900">Add Product</h3>
					<p class="text-sm text-gray-500">Create a new product</p>
				</div>
			</a>

			<a href="/admin/products" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
				<svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
				</svg>
				<div>
					<h3 class="font-medium text-gray-900">Manage Products</h3>
					<p class="text-sm text-gray-500">Edit, delete, update stock</p>
				</div>
			</a>

			<a href="/admin/orders" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
				<svg class="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
				</svg>
				<div>
					<h3 class="font-medium text-gray-900">Manage Orders</h3>
					<p class="text-sm text-gray-500">View and update orders</p>
				</div>
			</a>

			<a href="/admin/stock" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
				<svg class="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
				</svg>
				<div>
					<h3 class="font-medium text-gray-900">Stock Alerts</h3>
					<p class="text-sm text-gray-500">Manage inventory levels</p>
				</div>
			</a>
		</div>
	</div>

	<!-- Recent Activity (placeholder) -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
		<div class="space-y-3">
			<div class="flex items-center justify-between py-2 border-b border-gray-100">
				<div>
					<p class="text-sm font-medium text-gray-900">New order #VS-12345</p>
					<p class="text-xs text-gray-500">2 minutes ago</p>
				</div>
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
					New
				</span>
			</div>
			<div class="flex items-center justify-between py-2 border-b border-gray-100">
				<div>
					<p class="text-sm font-medium text-gray-900">Product "Handwoven Alpaca Scarf" is low on stock</p>
					<p class="text-xs text-gray-500">1 hour ago</p>
				</div>
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
					Alert
				</span>
			</div>
			<div class="flex items-center justify-between py-2">
				<div>
					<p class="text-sm font-medium text-gray-900">Order #VS-12344 shipped</p>
					<p class="text-xs text-gray-500">3 hours ago</p>
				</div>
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
					Shipped
				</span>
			</div>
		</div>
	</div>
</main> 