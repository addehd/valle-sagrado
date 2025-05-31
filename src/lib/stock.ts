import type { Product } from '$lib/types';

// Stock status types
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder_allowed';

export interface StockInfo {
	status: StockStatus;
	quantity: number;
	available: boolean;
	message: string;
	color: 'green' | 'yellow' | 'red' | 'blue';
}

export interface StockAlert {
	productSku: string;
	productName: string;
	currentStock: number;
	threshold: number;
	severity: 'low' | 'critical' | 'out';
}

// Configuration
export const LOW_STOCK_THRESHOLD = 10;
export const CRITICAL_STOCK_THRESHOLD = 5;

/**
 * Get stock information for a product
 */
export function getStockInfo(product: Product): StockInfo {
	const stockQuantity = getStockQuantity(product);
	const trackInventory = product.track_inventory ?? true;
	const allowBackorders = product.allow_backorders ?? false;

	// If not tracking inventory, always show as available
	if (!trackInventory) {
		return {
			status: 'in_stock',
			quantity: stockQuantity,
			available: true,
			message: 'In Stock',
			color: 'green'
		};
	}

	// Out of stock scenarios
	if (stockQuantity <= 0) {
		if (allowBackorders) {
			return {
				status: 'backorder_allowed',
				quantity: stockQuantity,
				available: true,
				message: 'Available on Backorder',
				color: 'blue'
			};
		} else {
			return {
				status: 'out_of_stock',
				quantity: stockQuantity,
				available: false,
				message: 'Out of Stock',
				color: 'red'
			};
		}
	}

	// Low stock scenarios
	if (stockQuantity <= CRITICAL_STOCK_THRESHOLD) {
		return {
			status: 'low_stock',
			quantity: stockQuantity,
			available: true,
			message: `Only ${stockQuantity} left!`,
			color: 'red'
		};
	}

	if (stockQuantity <= LOW_STOCK_THRESHOLD) {
		return {
			status: 'low_stock',
			quantity: stockQuantity,
			available: true,
			message: `Low Stock (${stockQuantity} remaining)`,
			color: 'yellow'
		};
	}

	// In stock
	return {
		status: 'in_stock',
		quantity: stockQuantity,
		available: true,
		message: 'In Stock',
		color: 'green'
	};
}

/**
 * Get normalized stock quantity from product
 * Handles both 'stock' and 'stock_quantity' field variations
 */
export function getStockQuantity(product: Product): number {
	return product.stock_quantity ?? product.stock ?? 0;
}

/**
 * Check if product is available for purchase
 */
export function isProductAvailable(product: Product): boolean {
	const stockInfo = getStockInfo(product);
	return stockInfo.available;
}

/**
 * Check if product has sufficient stock for a given quantity
 */
export function hasEnoughStock(product: Product, requestedQuantity: number): boolean {
	const stockQuantity = getStockQuantity(product);
	const trackInventory = product.track_inventory ?? true;
	const allowBackorders = product.allow_backorders ?? false;

	// If not tracking inventory, always allow
	if (!trackInventory) {
		return true;
	}

	// If backorders allowed, always allow
	if (allowBackorders) {
		return true;
	}

	// Check actual stock
	return stockQuantity >= requestedQuantity;
}

/**
 * Get maximum purchasable quantity
 */
export function getMaxPurchaseQuantity(product: Product): number {
	const stockQuantity = getStockQuantity(product);
	const trackInventory = product.track_inventory ?? true;
	const allowBackorders = product.allow_backorders ?? false;

	// If not tracking inventory or backorders allowed, return high number
	if (!trackInventory || allowBackorders) {
		return 999; // Reasonable upper limit
	}

	return Math.max(0, stockQuantity);
}

/**
 * Generate stock alerts for low inventory products
 */
export function generateStockAlerts(products: Product[]): StockAlert[] {
	const alerts: StockAlert[] = [];

	for (const product of products) {
		const stockQuantity = getStockQuantity(product);
		
		// Skip if not tracking inventory
		if (!product.track_inventory) continue;

		// Out of stock
		if (stockQuantity <= 0) {
			alerts.push({
				productSku: product.sku,
				productName: product.name,
				currentStock: stockQuantity,
				threshold: 0,
				severity: 'out'
			});
		}
		// Critical stock
		else if (stockQuantity <= CRITICAL_STOCK_THRESHOLD) {
			alerts.push({
				productSku: product.sku,
				productName: product.name,
				currentStock: stockQuantity,
				threshold: CRITICAL_STOCK_THRESHOLD,
				severity: 'critical'
			});
		}
		// Low stock
		else if (stockQuantity <= LOW_STOCK_THRESHOLD) {
			alerts.push({
				productSku: product.sku,
				productName: product.name,
				currentStock: stockQuantity,
				threshold: LOW_STOCK_THRESHOLD,
				severity: 'low'
			});
		}
	}

	// Sort by severity (out > critical > low) then by stock quantity (ascending)
	return alerts.sort((a, b) => {
		const severityOrder = { out: 3, critical: 2, low: 1 };
		const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
		if (severityDiff !== 0) return severityDiff;
		
		return a.currentStock - b.currentStock;
	});
}

/**
 * Calculate estimated restock date (placeholder for future enhancement)
 */
export function getEstimatedRestockDate(product: Product): Date | null {
	// This would typically integrate with supplier/inventory management systems
	// For now, return null to indicate no estimated date available
	return null;
}

/**
 * Format stock display text
 */
export function formatStockDisplay(product: Product, showQuantity: boolean = false): string {
	const stockInfo = getStockInfo(product);
	
	if (!showQuantity) {
		return stockInfo.message;
	}

	const quantity = stockInfo.quantity;
	
	switch (stockInfo.status) {
		case 'in_stock':
			return `${stockInfo.message} (${quantity} available)`;
		case 'low_stock':
			return stockInfo.message; // Already includes quantity
		case 'out_of_stock':
			return stockInfo.message;
		case 'backorder_allowed':
			return stockInfo.message;
		default:
			return stockInfo.message;
	}
}

/**
 * Get stock badge styling classes
 */
export function getStockBadgeClasses(stockInfo: StockInfo): string {
	const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
	
	switch (stockInfo.color) {
		case 'green':
			return `${baseClasses} bg-green-100 text-green-800`;
		case 'yellow':
			return `${baseClasses} bg-yellow-100 text-yellow-800`;
		case 'red':
			return `${baseClasses} bg-red-100 text-red-800`;
		case 'blue':
			return `${baseClasses} bg-blue-100 text-blue-800`;
		default:
			return `${baseClasses} bg-gray-100 text-gray-800`;
	}
}

/**
 * Bulk update stock quantities (for admin/inventory management)
 */
export interface StockUpdateItem {
	sku: string;
	quantity: number;
	operation: 'set' | 'add' | 'subtract';
}

export function calculateNewStockQuantity(
	currentStock: number,
	update: StockUpdateItem
): number {
	switch (update.operation) {
		case 'set':
			return Math.max(0, update.quantity);
		case 'add':
			return Math.max(0, currentStock + update.quantity);
		case 'subtract':
			return Math.max(0, currentStock - update.quantity);
		default:
			return currentStock;
	}
}

/**
 * Validate stock update operations
 */
export function validateStockUpdate(update: StockUpdateItem): { valid: boolean; error?: string } {
	if (!update.sku || update.sku.trim().length === 0) {
		return { valid: false, error: 'SKU is required' };
	}

	if (typeof update.quantity !== 'number' || update.quantity < 0) {
		return { valid: false, error: 'Quantity must be a non-negative number' };
	}

	if (!['set', 'add', 'subtract'].includes(update.operation)) {
		return { valid: false, error: 'Operation must be set, add, or subtract' };
	}

	return { valid: true };
}

/**
 * Reserve stock for an order (reduces available quantity)
 */
export function reserveStock(product: Product, quantity: number): {
	success: boolean;
	newStockLevel?: number;
	error?: string;
} {
	if (!hasEnoughStock(product, quantity)) {
		return {
			success: false,
			error: 'Insufficient stock available'
		};
	}

	const currentStock = getStockQuantity(product);
	const newStockLevel = currentStock - quantity;

	return {
		success: true,
		newStockLevel: Math.max(0, newStockLevel)
	};
}

/**
 * Release reserved stock (increases available quantity)
 */
export function releaseStock(currentStock: number, quantity: number): number {
	return currentStock + quantity;
} 