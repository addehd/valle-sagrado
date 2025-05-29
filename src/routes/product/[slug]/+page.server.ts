import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { slug } = params;

  console.log(slug);

  const { data: product, error } = await locals.supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) {
    return { product: null, error };
  }

  console.log(product);
  
  return { product };
};

export const actions: Actions = {
  addToCart: async ({ request, locals: { supabase, safeGetSession } }) => {
    const formData = await request.formData();
    const productSku = formData.get('product_sku') as string;
    const quantity = parseInt(formData.get('quantity') as string) || 1;

    // Check if user is authenticated
    const { session } = await safeGetSession();
    if (!session?.user) {
      return fail(401, { error: 'You must be logged in to add items to cart' });
    }

    // Validate inputs
    if (!productSku) {
      return fail(400, { error: 'Product SKU is required' });
    }

    if (quantity < 1) {
      return fail(400, { error: 'Quantity must be at least 1' });
    }

    try {
      // Check if product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('sku, name, stock')
        .eq('sku', productSku)
        .single();

      if (productError || !product) {
        return fail(404, { error: 'Product not found' });
      }

      // Check if there's enough stock
      if (product.stock < quantity) {
        return fail(400, { error: 'Not enough stock available' });
      }

      // Try to insert or update cart item
      const { data: existingCartItem, error: fetchError } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', session.user.id)
        .eq('product_sku', productSku)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new items
        console.error('Error fetching cart item:', fetchError);
        return fail(500, { error: 'Failed to check cart' });
      }

      if (existingCartItem) {
        // Update existing cart item
        const newQuantity = existingCartItem.quantity + quantity;
        
        // Check if new quantity exceeds stock
        if (newQuantity > product.stock) {
          return fail(400, { error: 'Not enough stock for requested quantity' });
        }

        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('user_id', session.user.id)
          .eq('product_sku', productSku);

        if (updateError) {
          console.error('Error updating cart:', updateError);
          return fail(500, { error: 'Failed to update cart' });
        }
      } else {
        // Insert new cart item
        const { error: insertError } = await supabase
          .from('cart')
          .insert({
            user_id: session.user.id,
            product_sku: productSku,
            quantity: quantity
          });

        if (insertError) {
          console.error('Error adding to cart:', insertError);
          return fail(500, { error: 'Failed to add item to cart' });
        }
      }

      // Get updated cart totals for immediate UI feedback
      const { data: cartData } = await supabase
        .from('cart')
        .select(`
          quantity,
          products!inner(price)
        `)
        .eq('user_id', session.user.id);

      const totalItems = cartData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const totalPrice = cartData?.reduce((sum, item) => {
        const price = (item.products as any)?.price || 0;
        return sum + (price * item.quantity);
      }, 0) || 0;

      return { 
        success: true, 
        message: 'Item added to cart successfully',
        totalItems,
        totalPrice
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return fail(500, { error: 'An unexpected error occurred' });
    }
  }
}; 