import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals: { supabase } }) => {
	try {
		const { data: product, error } = await supabase
			.from('products')
			.select('*')
			.eq('sku', params.sku)
			.single();

		if (error || !product) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		return json(product);
	} catch (error) {
		console.error('Error fetching product:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals: { supabase } }) => {
	try {
		const formData = await request.formData();
		
		// Extract form data
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const brand = formData.get('brand') as string;
		const description = formData.get('description') as string;
		const price = parseFloat(formData.get('price') as string);
		const sale_price_str = formData.get('sale_price') as string;
		const sale_price = sale_price_str ? parseFloat(sale_price_str) : null;
		const sale_start = formData.get('sale_start') as string || null;
		const sale_end = formData.get('sale_end') as string || null;
		const currency = formData.get('currency') as string;
		const stock = parseInt(formData.get('stock') as string);
		const status = formData.get('status') as string;
		const weight_grams_str = formData.get('weight_grams') as string;
		const weight_grams = weight_grams_str ? parseInt(weight_grams_str) : null;
		const dimensions_cm_str = formData.get('dimensions_cm') as string;
		const dimensions_cm = dimensions_cm_str ? JSON.parse(dimensions_cm_str) : null;
		const track_inventory = formData.get('track_inventory') === 'true';
		const allow_backorders = formData.get('allow_backorders') === 'true';
		const categories_str = formData.get('categories') as string;
		const categories = categories_str ? JSON.parse(categories_str) : null;
		const attributes_str = formData.get('attributes') as string;
		const attributes = attributes_str ? JSON.parse(attributes_str) : null;
		const existing_images_str = formData.get('existing_images') as string;
		const existing_images = existing_images_str ? JSON.parse(existing_images_str) : [];

		// Handle new image uploads (simplified - in production you'd upload to storage)
		const newImages = formData.getAll('images') as File[];
		const newImageUrls: string[] = [];
		
		// For now, we'll just use placeholder URLs for new images
		// In production, you'd upload to Supabase Storage or another service
		for (let i = 0; i < newImages.length; i++) {
			if (newImages[i].size > 0) {
				newImageUrls.push(`/api/placeholder/image/${Date.now()}-${i}.jpg`);
			}
		}

		// Combine existing and new images
		const allImages = [...existing_images, ...newImageUrls];

		// Update product
		const { data: product, error } = await supabase
			.from('products')
			.update({
				name,
				slug: slug || null,
				brand: brand || null,
				description,
				price,
				sale_price,
				sale_start: sale_start || null,
				sale_end: sale_end || null,
				currency,
				stock_quantity: stock,
				status,
				weight_grams,
				dimensions_cm,
				track_inventory,
				allow_backorders,
				images: allImages,
				categories,
				attributes,
				updated_at: new Date().toISOString()
			})
			.eq('sku', params.sku)
			.select()
			.single();

		if (error) {
			console.error('Error updating product:', error);
			return json({ error: 'Failed to update product' }, { status: 500 });
		}

		return json(product);
	} catch (error) {
		console.error('Error updating product:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals: { supabase } }) => {
	try {
		const { error } = await supabase
			.from('products')
			.delete()
			.eq('sku', params.sku);

		if (error) {
			console.error('Error deleting product:', error);
			return json({ error: 'Failed to delete product' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting product:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 