import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { supabase } = locals;

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file || file.size === 0) {
			throw error(400, 'No se proporcionó ningún archivo');
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			throw error(400, 'Por favor selecciona un archivo de imagen válido');
		}

		// Validate file size (5MB max)
		const MAX_SIZE = 5 * 1024 * 1024;
		if (file.size > MAX_SIZE) {
			throw error(400, 'La imagen es demasiado grande. Máximo 5MB');
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
			throw error(500, `Error al subir: ${storageError.message}`);
		}

		// Get public URL
		const { data: publicUrlData } = supabase.storage
			.from('teacher')
			.getPublicUrl(filePath);

		return json({
			success: true,
			url: publicUrlData.publicUrl,
			fileName: file.name
		});

	} catch (err) {
		console.error('Error in upload endpoint:', err);
		if ((err as any).status) {
			throw err; // Re-throw SvelteKit errors
		}
		throw error(500, 'Error al subir la imagen');
	}
};
