import type { PageServerLoad } from './$types';
import type { Product } from '$lib/types';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const { project } = params;

	try {
		// First, get the project info to get the project_id
		const { data: projectData, error: projectError } = await supabase
			.from('projects_info')
			.select('id, name')
			.eq('url', project)
			.single();

		if (projectError) {
			console.error('Error fetching project:', projectError);
			return {
				products: [],
				categories: { categories: [], flat: [] },
				project: null,
				error: 'Project not found'
			};
		}

		// Load categories - moved from API
		const { data: categoriesData, error: categoriesError } = await supabase
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

		// Build hierarchical structure for categories
		let categories = { categories: [], flat: [] };
		if (!categoriesError && categoriesData) {
			const categoriesMap = new Map();
			const rootCategories: any[] = [];

			// First pass: create map of all categories
			categoriesData.forEach(category => {
				categoriesMap.set(category.id, { ...category, children: [] });
			});

			// Second pass: build hierarchy
			categoriesData.forEach(category => {
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

			categories = {
				categories: rootCategories,
				flat: categoriesData
			};
		}

		// Load all products for this project (categories is JSONB, not a foreign key)
		const { data: products, error: productsError } = await supabase
			.from('products')
			.select('*')
			.eq('project_id', projectData.id)
			.eq('status', 'active')
			.order('created_at', { ascending: false });

		if (productsError) {
			console.error('Error fetching products:', productsError);
			return {
				products: [],
				categories,
				project: projectData,
				error: 'Failed to load products'
			};
		}

		// Transform the data to match our Product interface
		const transformedProducts: Product[] = (products || []).map(product => ({
			...product,
			// Handle JSONB fields
			images: Array.isArray(product.images) ? product.images : 
					typeof product.images === 'string' ? [product.images] : 
					product.images?.urls || [],
			
			// Handle stock field variations
			stock_quantity: product.stock || product.stock_quantity || 0,
			
			// Handle attributes/tags from JSONB
			tags: product.attributes?.tags || product.tags || [],
			
			// Map status to is_active
			is_active: product.status === 'active',
			
			// Handle categories from JSONB field
			categories: product.categories && product.categories.length > 0 ? {
				id: '1', // Default ID since categories is an array
				name: Array.isArray(product.categories) ? product.categories[0] : product.categories,
				slug: Array.isArray(product.categories) ? product.categories[0]?.toLowerCase().replace(/\s+/g, '-') : product.categories?.toLowerCase().replace(/\s+/g, '-'),
				description: '',
				parent_id: null,
				image_url: null,
				sort_order: 0,
				is_active: true,
				created_at: product.created_at,
				updated_at: product.updated_at
			} : undefined,
			
			// Handle dimensions
			dimensions: product.dimensions_cm ? {
				length: product.dimensions_cm.length,
				width: product.dimensions_cm.width,
				height: product.dimensions_cm.height,
				unit: 'cm'
			} : undefined,
			
			// Handle featured status from attributes
			is_featured: product.attributes?.featured === true || product.attributes?.featured === 'true' || false,
			
			// Ensure required fields have defaults
			track_inventory: product.track_inventory ?? true,
			allow_backorders: product.allow_backorders ?? false,
			requires_shipping: product.requires_shipping ?? true,
			currency: product.currency || 'USD'
		}));

		return {
			products: transformedProducts,
			categories,
			project: projectData,
			error: null
		};

	} catch (error) {
		console.error('Unexpected error loading products:', error);
		return {
			products: [],
			categories: { categories: [], flat: [] },
			project: null,
			error: 'An unexpected error occurred'
		};
	}
}; 