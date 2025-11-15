import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const { supabase } = locals;
	const { slug } = params;

	// Fetch the page from coach_pages table
	const { data: page, error: pageError } = await supabase
		.from('coach_pages')
		.select('*')
		.eq('slug', slug)
		.eq('user_id', 'aff48303-4d2e-4899-8a48-39b05dab17d3')
		.eq('is_active', true)
		.single();

	if (pageError || !page) {
		throw error(404, 'Page not found');
	}

	// Check if there are other language versions of this page
	const { data: alternatePages } = await supabase
		.from('coach_pages')
		.select('slug, language, title')
		.eq('user_id', 'aff48303-4d2e-4899-8a48-39b05dab17d3')
		.eq('is_active', true)
		.eq('sort_order', page.sort_order)
		.neq('language', page.language);

	return {
		page,
		alternatePages: alternatePages || []
	};
};

