<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let orders: any[] = [];
	let loading = true;
	let error = '';
	let searchQuery = '';
	let statusFilter = 'all';
	let sortBy = 'created_at';
	let sortOrder = 'desc';

	// Filter options
	const statusOptions = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'processing', label: 'Processing' },
		{ value: 'shipped', label: 'Shipped' },
		{ value: 'delivered', label: 'Delivered' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	const sortOptions = [
		{ value: 'created_at', label: 'Order Date' },
		{ value: 'total_amount', label: 'Total Amount' },
		{ value: 'order_number', label: 'Order Number' },
		{ value: 'status', label: 'Status' }
	];

	onMount(async () => {
		await loadOrders();
	});

	async function loadOrders() {
		try {
			loading = true;
			const response = await fetch('/api/admin/orders');
			if (response.ok) {
				orders = await response.json();
			} else {
				error = 'Failed to load orders';
			}
		} catch (err) {
			console.error('Error loading orders:', err);
			error = 'Failed to load orders';
		} finally {
			loading = false;
		}
	}

	async function updateOrderStatus(orderId: string, newStatus: string) {
		try {
			const response = await fetch(`/api/admin/orders/${orderId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (response.ok) {
				// Update local state
				orders = orders.map(order => 
					order.id === orderId ? { ...order, status: newStatus } : order
				);
			} else {
				alert('Failed to update order status');
			}
		} catch (err) {
			console.error('Error updating order status:', err);
			alert('Failed to update order status');
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

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800';
			case 'processing': return 'bg-blue-100 text-blue-800';
			case 'shipped': return 'bg-purple-100 text-purple-800';
			case 'delivered': return 'bg-green-100 text-green-800';
			case 'cancelled': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	// Computed filtered and sorted orders
	$: filteredOrders = orders
		.filter(order => {
			const matchesSearch = !searchQuery || 
				order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.shipping_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.shipping_email?.toLowerCase().includes(searchQuery.toLowerCase());
			
			const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
			
			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => {
			let aVal = a[sortBy];
			let bVal = b[sortBy];
			
			// Handle numeric values
			if (sortBy === 'total_amount') {
				aVal = parseFloat(aVal);
				bVal = parseFloat(bVal);
			}
			
			// Handle date values
			if (sortBy === 'created_at') {
				aVal = new Date(aVal);
				bVal = new Date(bVal);
			}
			
			if (sortOrder === 'asc') {
				return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			} else {
				return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
			}
		});
</script>

<svelte:head>
	<title>Order Management | Admin | Valle Sagrado</title>
</svelte:head>

<main class="container mx-auto px-6 py-8 max-w-7xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
			<p class="text-gray-600 mt-1">Manage customer orders and track fulfillment</p>
		</div>
		<a href="/admin" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
			← Back to Dashboard
		</a>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			<p class="text-red-800">{error}</p>
			<button on:click={loadOrders} class="text-red-600 hover:text-red-500 underline mt-2">Try Again</button>
		</div>
	{/if}

	<!-- Filters and Search -->
	<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<!-- Search -->
			<div>
				<label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
				<input
					id="search"
					type="text"
					bind:value={searchQuery}
					placeholder="Order number, customer name..."
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Status Filter -->
			<div>
				<label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
				<select
					id="status-filter"
					bind:value={statusFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{#each statusOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Sort By -->
			<div>
				<label for="sort-by" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
				<select
					id="sort-by"
					bind:value={sortBy}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{#each sortOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Sort Order -->
			<div>
				<label for="sort-order" class="block text-sm font-medium text-gray-700 mb-1">Order</label>
				<select
					id="sort-order"
					bind:value={sortOrder}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="desc">Newest First</option>
					<option value="asc">Oldest First</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Orders Table -->
	<div class="bg-white rounded-lg shadow-sm overflow-hidden">
		{#if loading}
			<div class="p-8 text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
				<p class="mt-2 text-gray-600">Loading orders...</p>
			</div>
		{:else if filteredOrders.length === 0}
			<div class="p-8 text-center">
				<p class="text-gray-500">No orders found</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Order
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Customer
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Amount
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Date
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredOrders as order}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">#{order.order_number}</div>
									<div class="text-sm text-gray-500">{order.id.slice(0, 8)}...</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">{order.shipping_name || 'N/A'}</div>
									<div class="text-sm text-gray-500">{order.shipping_email || 'N/A'}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">{formatCurrency(parseFloat(order.total_amount))}</div>
									<div class="text-sm text-gray-500">{order.currency || 'USD'}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(order.status)}">
										{order.status || 'pending'}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatDate(order.created_at)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div class="flex items-center space-x-2">
										<select
											value={order.status || 'pending'}
											on:change={(e) => updateOrderStatus(order.id, (e.target as HTMLSelectElement).value)}
											class="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
										>
											<option value="pending">Pending</option>
											<option value="processing">Processing</option>
											<option value="shipped">Shipped</option>
											<option value="delivered">Delivered</option>
											<option value="cancelled">Cancelled</option>
										</select>
										
										<button
											on:click={() => goto(`/admin/orders/${order.id}`)}
											class="text-blue-600 hover:text-blue-900"
										>
											View Details
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<!-- Summary Stats -->
	<div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="bg-white rounded-lg shadow-sm p-4">
			<div class="text-sm font-medium text-gray-500">Total Orders</div>
			<div class="text-2xl font-bold text-gray-900">{filteredOrders.length}</div>
		</div>
		
		<div class="bg-white rounded-lg shadow-sm p-4">
			<div class="text-sm font-medium text-gray-500">Pending</div>
			<div class="text-2xl font-bold text-yellow-600">
				{filteredOrders.filter(o => o.status === 'pending').length}
			</div>
		</div>
		
		<div class="bg-white rounded-lg shadow-sm p-4">
			<div class="text-sm font-medium text-gray-500">Processing</div>
			<div class="text-2xl font-bold text-blue-600">
				{filteredOrders.filter(o => o.status === 'processing').length}
			</div>
		</div>
		
		<div class="bg-white rounded-lg shadow-sm p-4">
			<div class="text-sm font-medium text-gray-500">Completed</div>
			<div class="text-2xl font-bold text-green-600">
				{filteredOrders.filter(o => ['delivered', 'shipped'].includes(o.status)).length}
			</div>
		</div>
	</div>
</main> 