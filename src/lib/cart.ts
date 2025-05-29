import type { SupabaseClient } from '@supabase/supabase-js';

export interface CartItem {
  id: string;
  user_id: string;
  product_sku: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Product details from join
  product?: {
    name: string;
    price: number;
    currency: string;
    images?: string[];
    stock: number;
  };
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Get cart items for a user
export async function getCartItems(supabase: SupabaseClient, userId: string): Promise<CartSummary> {
  const { data: cartItems, error } = await supabase
    .from('cart')
    .select(`
      *,
      products!inner(
        name,
        price,
        currency,
        images,
        stock
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading cart:', error);
    return { items: [], totalItems: 0, totalPrice: 0 };
  }

  const items = cartItems?.map(item => ({
    ...item,
    product: item.products
  })) || [];

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return { items, totalItems, totalPrice };
}

// Get cart item count for a user (for header/nav display)
export async function getCartCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('cart')
    .select('quantity')
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }

  return data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
} 