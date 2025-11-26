import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load = async ({ params, locals }) => {
	const { supabase, user } = locals;
	const { slug } = params;

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
		const result = await supabase
			.from('coach_pages')
			.select('*')
			.eq('slug', slug)
			.eq('is_active', true)
			.single();
		page = result.data;
		pageError = result.error;
	}

	if (pageError || !page) {
		throw error(404, `Page "${slug}" not found`);
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
		alternatePages: alternatePages || [],
		user // Pass user to client for showing/hiding edit button
	};
};

export const actions = {
	updatePage: async ({ request, locals }) => {
		const { supabase, user } = locals;
		
		// Check if user is authenticated
		if (!user) {
			return fail(401, {
				error: true,
				message: 'Debes iniciar sesión para editar páginas'
			});
		}
		
		const formData = await request.formData();

		try {
			// Get form data
			const pageId = formData.get('page_id')?.toString();
			const title = formData.get('title')?.toString();
			const content = formData.get('content')?.toString();

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
