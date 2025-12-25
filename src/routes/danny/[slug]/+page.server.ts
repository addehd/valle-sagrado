import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load = async ({ params, locals }) => {
	const { supabase, user } = locals;
	const { slug } = params;

	// Optimized: Single query instead of sequential fallback queries
	// Query by slug + is_active (slug should be unique, making this the fastest path)
	const { data: page, error: pageError } = await supabase
		.from('coach_pages')
		.select('*')
		.eq('slug', slug)
		.eq('is_active', true)
		.maybeSingle();

	if (pageError || !page) {
		throw error(404, `Page "${slug}" not found`);
	}

	// Fetch alternate pages (depends on page data, so can't parallelize)
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
				message: 'You must be logged in to edit pages'
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
				message: 'Title and content are required'
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
				throw updateError;
			}

			return {
				success: true,
			message: 'Page updated successfully'
			};

		} catch (err) {
			return fail(500, {
				error: true,
			message: 'Error updating the page. Please try again.'
			});
		}
	},

	uploadImage: async ({ request, locals }) => {
		console.log('🎯 uploadImage action called!');
		
		try {
			console.log('📦 Getting form data...');
			const formData = await request.formData();
			
			console.log('📄 Getting file from form data...');
			const file = formData.get('file') as File;
			
			console.log('🔍 File:', file ? file.name : 'NO FILE');

			if (!file || file.size === 0) {
				console.log('❌ No file or empty file');
				return fail(400, {
					error: true,
					message: 'No file provided'
				});
			}

			// Validate file type
			if (!file.type.startsWith('image/')) {
				console.log('❌ Invalid file type:', file.type);
				return fail(400, {
					error: true,
					message: 'Invalid file type'
				});
			}

			// Validate file size (5MB max)
			const MAX_SIZE = 5 * 1024 * 1024;
			if (file.size > MAX_SIZE) {
				console.log('❌ File too large:', file.size);
				return fail(400, {
					error: true,
					message: 'File too large'
				});
			}

			// Log image details to console
			console.log('=============================================');
			console.log('📸 IMAGE RECEIVED IN FORM ACTION');
			console.log('=============================================');
			console.log('File name:', file.name);
			console.log('File type:', file.type);
			console.log('File size:', `${(file.size / 1024).toFixed(2)} KB`);
			console.log('Timestamp:', new Date().toISOString());
			console.log('=============================================');

			// Return mock URL
			const mockUrl = `https://placehold.co/600x400/09f/fff?text=${encodeURIComponent(file.name)}`;
			
			console.log('✅ Returning success with mock URL');

			return {
				success: true,
				url: mockUrl,
				fileName: file.name
			};

		} catch (err) {
			console.error('💥 ERROR in uploadImage action:', err);
			console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
			return fail(500, {
				error: true,
				message: err instanceof Error ? err.message : 'Error uploading image'
			});
		}
	}
} satisfies Actions;
