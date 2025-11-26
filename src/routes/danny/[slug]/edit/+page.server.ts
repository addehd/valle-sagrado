import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { supabase } = locals;
	const { slug } = params;

	// Fetch the page from coach_pages table
	const { data: page, error: pageError } = await supabase
		.from('coach_pages')
		.select('*')
		.eq('slug', slug)
		.eq('user_id', 'aff48303-4d2e-4899-8a48-39b05dab17d3')
		.single();

	if (pageError || !page) {
		throw error(404, `Page "${slug}" not found`);
	}

	return {
		page
	};
};

export const actions = {
	updatePage: async ({ request, locals }) => {
		const { supabase } = locals;
		const formData = await request.formData();

		try {
			// Get form data
			const pageId = formData.get('page_id')?.toString();
			const title = formData.get('title')?.toString();
			const content = formData.get('content')?.toString();
			const metaDescription = formData.get('meta_description')?.toString() || null;
			const isActive = formData.get('is_active') === 'on';

			// Validate required fields
			if (!pageId || !title || !content) {
				return fail(400, {
					error: true,
					message: 'El título y el contenido son obligatorios'
				});
			}

			// Update the page in the database
			const { error: updateError } = await supabase
				.from('coach_pages')
				.update({
					title,
					content,
					meta_description: metaDescription,
					is_active: isActive,
					updated_at: new Date().toISOString()
				})
				.eq('id', pageId);

			if (updateError) {
				console.error('Error updating page:', updateError);
				throw updateError;
			}

			return {
				success: true,
				message: 'Página actualizada correctamente'
			};

		} catch (err) {
			console.error('Error in updatePage action:', err);
			return fail(500, {
				error: true,
				message: 'Error al actualizar la página. Por favor intenta de nuevo.'
			});
		}
	}
} satisfies Actions;
