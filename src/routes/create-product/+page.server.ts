import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    try {
      // Parse fields
      const sku = formData.get('sku') as string;
      const slug = formData.get('slug') as string;
      const name = formData.get('name') as string;
      const brand = formData.get('brand') as string;
      const description = formData.get('description') as string;
      const price = parseFloat(formData.get('price') as string);
      const sale_price = formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null;
      const sale_start = formData.get('sale_start') || null;
      const sale_end = formData.get('sale_end') || null;
      const currency = formData.get('currency') as string;
      const stock = parseInt(formData.get('stock') as string, 10);
      const status = formData.get('status') as string;
      const weight_grams = formData.get('weight_grams') ? parseInt(formData.get('weight_grams') as string, 10) : null;
      const dimensions_cm = formData.get('dimensions_cm') ? JSON.parse(formData.get('dimensions_cm') as string) : null;
      const categories = formData.get('categories') ? JSON.parse(formData.get('categories') as string) : [];
      const attributes = formData.get('attributes') ? JSON.parse(formData.get('attributes') as string) : {};

      // Handle images (array of File)
      const imagesFiles = formData.getAll('images') as File[];
      let images: string[] = [];
      for (const file of imagesFiles) {
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop();
          const filePath = `products/${crypto.randomUUID()}.${fileExt}`;
          const { data, error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
          if (uploadError) {
            return fail(400, { error: 'Image upload failed: ' + uploadError.message });
          }
          images.push(data.path);
        }
      }

      // Insert into Supabase
      const { error } = await supabase.from('products').insert({
        sku,
        slug,
        name,
        brand,
        description,
        price,
        sale_price,
        sale_start,
        sale_end,
        currency,
        stock,
        status,
        weight_grams,
        dimensions_cm,
        images,
        categories,
        attributes
      });
      if (error) {
        return fail(400, { error: error.message });
      }
      return { success: true };
    } catch (e: any) {
      return fail(400, { error: e.message || 'Unknown error' });
    }
  }
}; 