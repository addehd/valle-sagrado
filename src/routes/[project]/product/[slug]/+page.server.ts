import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { supabase } = locals;
	const { project: projectSlug, slug: productSlug } = params;

	// Get project info using projects_info table
	const { data: project, error: projectError } = await supabase
		.from('projects_info')
		.select('id, name, url')
		.eq('url', projectSlug)
		.single();

	if (projectError || !project) {
		throw error(404, 'Project not found');
	}

	// Get product data for this specific project
	const { data: product, error: productError } = await supabase
		.from('products')
		.select('*')
		.eq('slug', productSlug)
		.eq('project_id', project.id) // Filter by project ID
		.single();

	if (productError || !product) {
		throw error(404, 'Product not found');
	}

	return {
		project,
		product
	};
};

export const actions: Actions = {
	addToCart: async ({ request, params, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		
		if (!session?.user) {
			return fail(401, { error: 'Must be logged in to add items to cart' });
		}

		const data = await request.formData();
		const productId = data.get('product_id') as string;
		const quantity = parseInt(data.get('quantity') as string) || 1;

		if (!productId) {
			return fail(400, { error: 'Product ID is required' });
		}

		// Verify the product exists and belongs to the current project
		const { project } = params;
		const { data: projectData } = await supabase
			.from('projects_info')
			.select('id')
			.eq('url', project)
			.single();

		if (!projectData) {
			return fail(404, { error: 'Project not found' });
		}

		const { data: productCheck } = await supabase
			.from('products')
			.select('id')
			.eq('id', productId)
			.eq('project_id', projectData.id)
			.single();

		if (!productCheck) {
			return fail(400, { error: 'Product not found in this project' });
		}

		// Check if item already exists in cart
		const { data: existingItem } = await supabase
			.from('cart_items')
			.select('*')
			.eq('user_id', session.user.id)
			.eq('product_id', productId)
			.single();

		if (existingItem) {
			// Update quantity
			const { error } = await supabase
				.from('cart_items')
				.update({ 
					quantity: existingItem.quantity + quantity,
					updated_at: new Date().toISOString()
				})
				.eq('id', existingItem.id);

			if (error) {
				return fail(500, { error: 'Failed to update cart' });
			}
		} else {
			// Add new item
			const { error } = await supabase
				.from('cart_items')
				.insert({
					user_id: session.user.id,
					product_id: productId,
					quantity
				});

			if (error) {
				return fail(500, { error: 'Failed to add to cart' });
			}
		}

		return { success: true, message: 'Added to cart successfully' };
	}
}; 