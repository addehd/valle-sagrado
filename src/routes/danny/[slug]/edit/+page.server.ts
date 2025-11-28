import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { supabase } = locals;
	const { slug } = params;

	console.log('🔍 LOAD: Fetching page with slug:', slug);

	// Get current user
	const { data: { user } } = await supabase.auth.getUser();
	console.log('👤 LOAD: Current user:', user?.id, user?.email);

	// Fetch the page from coach_pages table
	// Remove the hardcoded user_id filter to allow any user's page
	const { data: page, error: pageError } = await supabase
		.from('coach_pages')
		.select('*')
		.eq('slug', slug)
		.single();

	if (pageError || !page) {
		console.log('❌ LOAD: Page not found or error:', pageError);
		throw error(404, `Page "${slug}" not found`);
	}

	// Check if current user owns this page
	if (user && page.user_id !== user.id) {
		console.log('⚠️ LOAD: User does not own this page');
		console.log('   Page owner:', page.user_id);
		console.log('   Current user:', user.id);
	}

	console.log('✅ LOAD: Page loaded:', {
		id: page.id,
		title: page.title,
		contentLength: page.content?.length,
		updatedAt: page.updated_at,
		userId: page.user_id
	});

	return {
		page,
		currentUserId: user?.id,
		currentUserEmail: user?.email
	};
};

export const actions = {
	updatePage: async ({ request, locals, params }) => {
		const { supabase } = locals;
		const formData = await request.formData();
		const { slug } = params;

		console.log('🚀 Server: updatePage action called');
		
		// Log all form data entries
		console.log('📋 Server: FormData entries:');
		for (const [key, value] of formData.entries()) {
			const displayValue = typeof value === 'string' ? value.substring(0, 100) : value;
			console.log(`  ${key}:`, displayValue);
		}

		try {
			// Get form data
			const pageId = formData.get('page_id')?.toString();
			const title = formData.get('title')?.toString();
			const content = formData.get('content')?.toString();
			const metaDescription = formData.get('meta_description')?.toString() || null;
			const isActiveRaw = formData.get('is_active');
			const isActive = isActiveRaw === 'on' || isActiveRaw === 'true';

			console.log('🔍 Server: Parsed values:', {
				pageId,
				title,
				contentLength: content?.length,
				metaDescription,
				isActiveRaw,
				isActive
			});

			// Validate required fields
			if (!pageId || !title || !content) {
				console.log('❌ Server: Validation failed', { pageId, title, contentLength: content?.length });
				return fail(400, {
					error: true,
					message: 'El título y el contenido son obligatorios'
				});
			}

		// Update the page in the database
		console.log('💾 Server: Attempting database update for page ID:', pageId);
		const updateData = {
			title,
			content,
			meta_description: metaDescription,
			is_active: isActive,
			updated_at: new Date().toISOString()
		};
		console.log('📝 Server: Update data:', {
			...updateData,
			content: content?.substring(0, 100) + '...',
			contentLength: content?.length
		});

		// Check current user
		const { data: { user } } = await supabase.auth.getUser();
		console.log('👤 Server: Current user ID:', user?.id);

		// Get page owner
		const { data: pageData } = await supabase
			.from('coach_pages')
			.select('user_id')
			.eq('id', pageId)
			.single();
		console.log('📄 Server: Page owner user_id:', pageData?.user_id);

		const { data: updatedRows, error: updateError } = await supabase
			.from('coach_pages')
			.update(updateData)
			.eq('id', pageId)
			.select();

		if (updateError) {
			console.error('❌ Server: Error updating page:', updateError);
			throw updateError;
		}

		// Check if any rows were actually updated (RLS might have blocked it)
		if (!updatedRows || updatedRows.length === 0) {
			console.error('❌ Server: No rows updated - RLS policy likely blocked the update');
			console.error('   Current user:', user?.id);
			console.error('   Page owner:', pageData?.user_id);
			console.error('   Match:', user?.id === pageData?.user_id);
			return fail(403, {
				error: true,
				message: 'No se pudo guardar: No tienes permisos para editar esta página. Por favor, inicia sesión con la cuenta correcta.'
			});
		}

		console.log('✅ Server: Page updated successfully. Rows affected:', updatedRows?.length);
		console.log('📊 Server: Updated page data:', {
			id: updatedRows?.[0]?.id,
			title: updatedRows?.[0]?.title,
			contentLength: updatedRows?.[0]?.content?.length,
			updatedAt: updatedRows?.[0]?.updated_at
		});
		
		// Verify the update by reading it back
		const { data: verifyPage } = await supabase
			.from('coach_pages')
			.select('id, title, slug, updated_at, content')
			.eq('id', pageId)
			.single();
		
		console.log('🔍 Server: Verification query result:', {
			...verifyPage,
			content: verifyPage?.content?.substring(0, 100) + '...',
			contentLength: verifyPage?.content?.length
		});
			
			// Redirect to the view page after successful update
			throw redirect(303, `/danny/${slug}`);

		} catch (err) {
			// Check if it's a redirect (which is actually success)
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				throw err;
			}
			
			console.error('Error in updatePage action:', err);
			return fail(500, {
				error: true,
				message: 'Error al actualizar la página. Por favor intenta de nuevo.'
			});
		}
	}
} satisfies Actions;
