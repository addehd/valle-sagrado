import { writable } from 'svelte/store';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface CartItem {
  id: string;
  user_id: string;
  product_sku: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Optional product details (can be joined)
  product?: {
    name: string;
    price: number;
    currency: string;
    images?: string[];
  };
}

// Simplified store - just for reactive UI updates
export interface CartStore {
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const initialState: CartStore = {
  totalItems: 0,
  totalPrice: 0,
  loading: false
};

function createCartStore() {
  const { subscribe, set, update } = writable<CartStore>(initialState);

  return {
    subscribe,
    
    // Refresh cart totals from database
    async refreshTotals(supabase: SupabaseClient, userId: string) {
      update(state => ({ ...state, loading: true }));
      
      try {
        const { data, error } = await supabase
          .from('cart')
          .select(`
            quantity,
            products!inner(price)
          `)
          .eq('user_id', userId);

        if (error) throw error;

        const totalItems = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        const totalPrice = data?.reduce((sum, item) => {
          const price = (item.products as any)?.price || 0;
          return sum + (price * item.quantity);
        }, 0) || 0;

        update(state => ({
          ...state,
          totalItems,
          totalPrice,
          loading: false
        }));
      } catch (error) {
        console.error('Error refreshing cart totals:', error);
        update(state => ({ ...state, loading: false }));
      }
    },

    // Optimistically update totals (for immediate UI feedback)
    updateTotals(totalItems: number, totalPrice: number) {
      update(state => ({ ...state, totalItems, totalPrice }));
    },

    // Reset store
    reset() {
      set(initialState);
    }
  };
}

export const cartStore = createCartStore(); 