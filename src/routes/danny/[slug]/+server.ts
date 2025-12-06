import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

console.log('✅ +server.ts module loaded at', new Date().toISOString());

export const POST: RequestHandler = async ({ request }) => {
	console.log('🚀 POST endpoint called');
	
	try {
		console.log('📦 Parsing form data...');
		const formData = await request.formData();
		const file = formData.get('file') as File;

		console.log('📄 File received:', file?.name || 'No file');

		if (!file || file.size === 0) {
			console.log('❌ No file or empty file');
			return json({ success: false, message: 'No file provided' }, { status: 400 });
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			console.log('❌ Invalid file type:', file.type);
			return json({ success: false, message: 'Invalid file type' }, { status: 400 });
		}

		// Validate file size (5MB max)
		const MAX_SIZE = 5 * 1024 * 1024;
		if (file.size > MAX_SIZE) {
			console.log('❌ File too large:', file.size);
			return json({ success: false, message: 'File too large' }, { status: 400 });
		}

		// Log image details
		console.log('=============================================');
		console.log('📸 IMAGE RECEIVED ON SERVER');
		console.log('=============================================');
		console.log('File name:', file.name);
		console.log('File type:', file.type);
		console.log('File size:', `${(file.size / 1024).toFixed(2)} KB`);
		console.log('Timestamp:', new Date().toISOString());
		console.log('=============================================');

		// Return mock response
		const mockUrl = `https://placehold.co/600x400/09f/fff?text=${encodeURIComponent(file.name)}`;
		
		console.log('✅ Returning success with mock URL');
		return json({
			success: true,
			url: mockUrl,
			fileName: file.name
		});

	} catch (err) {
		console.error('💥 ERROR in POST handler:', err);
		console.error('Error details:', {
			message: err instanceof Error ? err.message : 'Unknown error',
			stack: err instanceof Error ? err.stack : undefined
		});
		
		return json({ 
			success: false, 
			message: err instanceof Error ? err.message : 'Error uploading image'
		}, { status: 500 });
	}
};

