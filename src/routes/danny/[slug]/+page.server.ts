import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const { supabase } = locals;
	const { slug } = params;

	console.log('[danny/[slug]] Loading page for slug:', slug);

	// Fetch the page from coach_pages table
	// Try by user_id first, then by project_id if that fails
	let { data: page, error: pageError } = await supabase
		.from('coach_pages')
		.select('*')
		.eq('slug', slug)
		.eq('user_id', 'aff48303-4d2e-4899-8a48-39b05dab17d3')
		.eq('is_active', true)
		.single();

	// If not found by user_id, try by project_id
	if (pageError || !page) {
		console.log('[danny/[slug]] Not found by user_id, trying by project_id...');
		const result = await supabase
			.from('coach_pages')
			.select('*')
			.eq('slug', slug)
			.eq('is_active', true)
			.single();
		page = result.data;
		pageError = result.error;
	}

	console.log('[danny/[slug]] Query result:', { page: !!page, error: pageError });

	if (pageError || !page) {
		console.error('[danny/[slug]] Page not found:', pageError);
		throw error(404, `Page "${slug}" not found - Check if it exists in coach_pages table with user_id='aff48303-4d2e-4899-8a48-39b05dab17d3' and is_active=true`);
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
