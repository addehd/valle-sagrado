import { writable } from 'svelte/store';
import type { CartItem, CartResponse, CartSummary } from '$lib/types';

interface CartState {
	items: CartItem[];
	summary: CartSummary;
	loading: boolean;
	error: string | null;
}

const initialState: CartState = {
	items: [],
	summary: {
		itemCount: 0,
		subtotal: 0,
		currency: 'USD'
	},
	loading: false,
	error: null
};

function createCartStore() {
	const { subscribe, set, update } = writable<CartState>(initialState);

	return {
		subscribe,
		
		async load() {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const response = await fetch('/api/cart');
				
				if (!response.ok) {
					throw new Error('Failed to load cart');
				}
				
				const data: CartResponse = await response.json();
				
				update(state => ({
					...state,
					items: data.items,
					summary: data.summary,
					loading: false
				}));
				
				return data;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				update(state => ({
					...state,
					loading: false,
					error: errorMessage
				}));
				throw error;
			}
		},

		async addItem(productSku: string, quantity: number = 1) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const response = await fetch('/api/cart', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ product_sku: productSku, quantity })
				});
				
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to add item to cart');
				}
				
				const data: CartResponse = await response.json();
				
				update(state => ({
					...state,
					items: data.items,
					summary: data.summary,
					loading: false
				}));
				
				return data;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				update(state => ({
					...state,
					loading: false,
					error: errorMessage
				}));
				throw error;
			}
		},

		async updateQuantity(productSku: string, quantity: number) {
			if (quantity <= 0) {
				return this.removeItem(productSku);
			}
			
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const response = await fetch('/api/cart', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ product_sku: productSku, quantity })
				});
				
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to update cart');
				}
				
				const data: CartResponse = await response.json();
				
				update(state => ({
					...state,
					items: data.items,
					summary: data.summary,
					loading: false
				}));
				
				return data;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				update(state => ({
					...state,
					loading: false,
					error: errorMessage
				}));
				throw error;
			}
		},

		async removeItem(productSku: string) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const response = await fetch('/api/cart', {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ product_sku: productSku })
				});
				
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to remove item from cart');
				}
				
				const data: CartResponse = await response.json();
				
				update(state => ({
					...state,
					items: data.items,
					summary: data.summary,
					loading: false
				}));
				
				return data;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				update(state => ({
					...state,
					loading: false,
					error: errorMessage
				}));
				throw error;
			}
		},

		async clear() {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				const response = await fetch('/api/cart', {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ clear_all: true })
				});
				
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to clear cart');
				}
				
				const data: CartResponse = await response.json();
				
				update(state => ({
					...state,
					items: data.items,
					summary: data.summary,
					loading: false
				}));
				
				return data;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				update(state => ({
					...state,
					loading: false,
					error: errorMessage
				}));
				throw error;
			}
		},

		clearError() {
			update(state => ({ ...state, error: null }));
		}
	};
}

export const cartStore = createCartStore();
export const cart = cartStore; // Backward compatibility alias

// Helper to get current cart state
function get<T>(store: { subscribe: (fn: (value: T) => void) => (() => void) }): T {
	let value: T;
	const unsubscribe = store.subscribe((v) => (value = v));
	unsubscribe();
	return value!;
} 