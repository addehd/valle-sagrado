import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession();
  
  let cartItems = [];
  let totalItems = 0;
  let totalPrice = 0;
  
  if (session?.user) {
    const { data, error } = await supabase
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
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      cartItems = data.map(item => ({
        ...item,
        product: item.products
      }));
      
      totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      totalPrice = cartItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + (price * item.quantity);
      }, 0);
    }
  }
  
  return {
    session,
    cartItems,
    totalItems,
    totalPrice
  };
};

export const actions: Actions = {
  updateQuantity: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session?.user) {
      return fail(401, { error: 'Not authenticated' });
    }

    const formData = await request.formData();
    const productSku = formData.get('product_sku') as string;
    const quantity = parseInt(formData.get('quantity') as string);

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', session.user.id)
        .eq('product_sku', productSku);

      if (error) {
        return fail(500, { error: 'Failed to remove item' });
      }
    } else {
      // Update quantity
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', session.user.id)
        .eq('product_sku', productSku);

      if (error) {
        return fail(500, { error: 'Failed to update quantity' });
      }
    }

    return { success: true };
  },

  removeItem: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session?.user) {
      return fail(401, { error: 'Not authenticated' });
    }

    const formData = await request.formData();
    const productSku = formData.get('product_sku') as string;

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', session.user.id)
      .eq('product_sku', productSku);

    if (error) {
      return fail(500, { error: 'Failed to remove item' });
    }

    return { success: true };
  },

  clearCart: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session?.user) {
      return fail(401, { error: 'Not authenticated' });
    }

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      return fail(500, { error: 'Failed to clear cart' });
    }

    return { success: true };
  }
}; 