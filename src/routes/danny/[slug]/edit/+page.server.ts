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
	uploadImage: async ({ request, locals }) => {
		const { supabase } = locals;
		const formData = await request.formData();

		try {
			const file = formData.get('file') as File;
			
			if (!file || file.size === 0) {
				return fail(400, { error: true, message: 'No file provided' });
			}

			// Validate file type
			if (!file.type.startsWith('image/')) {
				return fail(400, { error: true, message: 'Please select a valid image file' });
			}

			// Validate file size (5MB max)
			const MAX_SIZE = 5 * 1024 * 1024;
			if (file.size > MAX_SIZE) {
				return fail(400, { error: true, message: 'Image is too large. Maximum 5MB' });
			}

			const fileExt = file.name.split('.').pop();
			const fileName = `markdown-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
			const filePath = `markdown-images/${fileName}`;

			// Upload to Supabase Storage using server-side client (has auth)
			const { error: storageError } = await supabase.storage
				.from('teacher')
				.upload(filePath, file, {
					cacheControl: '3600',
					upsert: false
				});

			if (storageError) {
				console.error('Storage upload error:', storageError);
				return fail(500, { error: true, message: `Upload error: ${storageError.message}` });
			}

			// Get public URL
			const { data: publicUrlData } = supabase.storage
				.from('teacher')
				.getPublicUrl(filePath);

			return {
				success: true,
				url: publicUrlData.publicUrl,
				fileName: file.name
			};

		} catch (err) {
			console.error('Error in uploadImage action:', err);
			return fail(500, { error: true, message: 'Error uploading the image' });
		}
	},

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
				message: 'Title and content are required'
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
			message: 'Page updated successfully'
			};

		} catch (err) {
			console.error('Error in updatePage action:', err);
			return fail(500, {
				error: true,
			message: 'Error updating the page. Please try again.'
			});
		}
	}
} satisfies Actions;
