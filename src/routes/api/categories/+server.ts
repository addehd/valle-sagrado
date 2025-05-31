import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
	try {
		const { data: categories, error } = await supabase
			.from('categories')
			.select(`
				id,
				name,
				slug,
				description,
				parent_id,
				image_url,
				sort_order
			`)
			.eq('is_active', true)
			.order('sort_order', { ascending: true });

		if (error) {
			console.error('Database error:', error);
			return json(
				{ error: 'Failed to fetch categories' },
				{ status: 500 }
			);
		}

		// Build hierarchical structure
		const categoriesMap = new Map();
		const rootCategories: any[] = [];

		// First pass: create map of all categories
		categories?.forEach(category => {
			categoriesMap.set(category.id, { ...category, children: [] });
		});

		// Second pass: build hierarchy
		categories?.forEach(category => {
			const categoryWithChildren = categoriesMap.get(category.id);
			if (category.parent_id) {
				const parent = categoriesMap.get(category.parent_id);
				if (parent) {
					parent.children.push(categoryWithChildren);
				}
			} else {
				rootCategories.push(categoryWithChildren);
			}
		});

		return json({
			categories: rootCategories,
			flat: categories || []
		});
	} catch (error) {
		console.error('Unexpected error:', error);
		return json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}; 