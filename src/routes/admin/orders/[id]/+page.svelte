<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let order: any = null;
	let loading = true;
	let error = '';
	let updating = false;

	$: orderId = $page.params.id;

	onMount(async () => {
		if (orderId) {
			await loadOrder();
		}
	});

	async function loadOrder() {
		try {
			loading = true;
			const response = await fetch(`/api/admin/orders/${orderId}`);
			if (response.ok) {
				order = await response.json();
			} else {
				error = response.status === 404 ? 'Order not found' : 'Failed to load order';
			}
		} catch (err) {
			console.error('Error loading order:', err);
			error = 'Failed to load order';
		} finally {
			loading = false;
		}
	}

	async function updateOrderStatus(newStatus: string) {
		try {
			updating = true;
			const response = await fetch(`/api/admin/orders/${orderId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (response.ok) {
				const updatedOrder = await response.json();
				order = updatedOrder;
			} else {
				alert('Failed to update order status');
			}
		} catch (err) {
			console.error('Error updating order status:', err);
			alert('Failed to update order status');
		} finally {
			updating = false;
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
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
			case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
			case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
			case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}
</script>

<svelte:head>
	<title>Order #{order?.order_number || orderId} | Admin | Valle Sagrado</title>
</svelte:head>

<main class="container mx-auto px-6 py-8 max-w-7xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">
				Order #{order?.order_number || orderId}
			</h1>
			<p class="text-gray-600 mt-1">Order details and management</p>
		</div>
		<div class="flex items-center space-x-3">
			<a href="/admin/orders" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
				← Back to Orders
			</a>
		</div>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			<p class="text-red-800">{error}</p>
			<button on:click={loadOrder} class="text-red-600 hover:text-red-500 underline mt-2">Try Again</button>
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600">Loading order details...</p>
		</div>
	{:else if order}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Left Column: Order Details -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Order Status -->
				<div class="bg-white rounded-lg shadow-sm p-6">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-xl font-semibold text-gray-900">Order Status</h2>
						<span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full border {getStatusColor(order.status)}">
							{order.status || 'pending'}
						</span>
					</div>
					
					<div class="space-y-3">
						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Order Placed:</span>
							<span class="text-gray-900">{formatDate(order.created_at)}</span>
						</div>
						
						{#if order.shipped_at}
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Shipped:</span>
								<span class="text-gray-900">{formatDate(order.shipped_at)}</span>
							</div>
						{/if}
						
						{#if order.delivered_at}
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Delivered:</span>
								<span class="text-gray-900">{formatDate(order.delivered_at)}</span>
							</div>
						{/if}
					</div>

					<div class="mt-4 pt-4 border-t border-gray-200">
						<label for="status-update" class="block text-sm font-medium text-gray-700 mb-2">
							Update Status:
						</label>
						<div class="flex items-center space-x-3">
							<select
								id="status-update"
								value={order.status || 'pending'}
								on:change={(e) => updateOrderStatus((e.target as HTMLSelectElement).value)}
								disabled={updating}
								class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
							>
								<option value="pending">Pending</option>
								<option value="processing">Processing</option>
								<option value="shipped">Shipped</option>
								<option value="delivered">Delivered</option>
								<option value="cancelled">Cancelled</option>
							</select>
							{#if updating}
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Order Items -->
				<div class="bg-white rounded-lg shadow-sm p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
					
					{#if order.items && order.items.length > 0}
						<div class="space-y-4">
							{#each order.items as item}
								<div class="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
									<div class="flex-1">
										<h3 class="font-medium text-gray-900">{item.product_name}</h3>
										<p class="text-sm text-gray-500">SKU: {item.product_sku}</p>
									</div>
									<div class="text-center">
										<p class="text-sm text-gray-600">Qty</p>
										<p class="font-medium">{item.quantity}</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-gray-600">Price</p>
										<p class="font-medium">{formatCurrency(parseFloat(item.price))}</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-gray-600">Total</p>
										<p class="font-medium">{formatCurrency(parseFloat(item.price) * item.quantity)}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-gray-500">No items found for this order</p>
					{/if}
				</div>

				<!-- Shipping Information -->
				<div class="bg-white rounded-lg shadow-sm p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 class="font-medium text-gray-900 mb-2">Shipping Address</h3>
							<div class="text-sm text-gray-600 space-y-1">
								<p class="font-medium text-gray-900">{order.shipping_name}</p>
								<p>{order.shipping_address_line1}</p>
								{#if order.shipping_address_line2}
									<p>{order.shipping_address_line2}</p>
								{/if}
								<p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
								<p>{order.shipping_country}</p>
								{#if order.shipping_phone}
									<p>Phone: {order.shipping_phone}</p>
								{/if}
							</div>
						</div>

						<div>
							<h3 class="font-medium text-gray-900 mb-2">Contact Information</h3>
							<div class="text-sm text-gray-600 space-y-1">
								<p>Email: {order.shipping_email}</p>
								{#if order.shipping_phone}
									<p>Phone: {order.shipping_phone}</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Order Summary -->
			<div class="space-y-6">
				<!-- Order Summary -->
				<div class="bg-white rounded-lg shadow-sm p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
					
					<div class="space-y-3">
						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Subtotal:</span>
							<span class="text-gray-900">{formatCurrency(parseFloat(order.subtotal_amount || order.total_amount))}</span>
						</div>
						
						{#if order.shipping_amount}
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Shipping:</span>
								<span class="text-gray-900">{formatCurrency(parseFloat(order.shipping_amount))}</span>
							</div>
						{/if}
						
						{#if order.tax_amount}
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Tax:</span>
								<span class="text-gray-900">{formatCurrency(parseFloat(order.tax_amount))}</span>
							</div>
						{/if}
						
						<div class="border-t border-gray-200 pt-3">
							<div class="flex justify-between font-semibold">
								<span class="text-gray-900">Total:</span>
								<span class="text-gray-900">{formatCurrency(parseFloat(order.total_amount))}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Payment Information -->
				<div class="bg-white rounded-lg shadow-sm p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
					
					<div class="space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-600">Payment Method:</span>
							<span class="text-gray-900">{order.payment_method || 'Card'}</span>
						</div>
						
						<div class="flex justify-between">
							<span class="text-gray-600">Payment Status:</span>
							<span class="text-gray-900">{order.payment_status || 'Completed'}</span>
						</div>
						
						{#if order.stripe_payment_intent_id}
							<div class="flex justify-between">
								<span class="text-gray-600">Payment ID:</span>
								<span class="text-gray-900 text-xs">{order.stripe_payment_intent_id}</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- Order Meta -->
				<div class="bg-white rounded-lg shadow-sm p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
					
					<div class="space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-600">Order ID:</span>
							<span class="text-gray-900 text-xs">{order.id}</span>
						</div>
						
						<div class="flex justify-between">
							<span class="text-gray-600">Order Number:</span>
							<span class="text-gray-900">#{order.order_number}</span>
						</div>
						
						<div class="flex justify-between">
							<span class="text-gray-600">Currency:</span>
							<span class="text-gray-900">{order.currency || 'USD'}</span>
						</div>
						
						{#if order.updated_at && order.updated_at !== order.created_at}
							<div class="flex justify-between">
								<span class="text-gray-600">Last Updated:</span>
								<span class="text-gray-900">{formatDate(order.updated_at)}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</main> 