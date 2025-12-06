import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

console.log('✅ /api/upload-markdown-image endpoint loaded at', new Date().toISOString());

export const POST: RequestHandler = async ({ request, locals }) => {
  console.log('🚀 /api/upload-markdown-image POST hit');

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pageId = formData.get('pageId')?.toString();

    const { user, supabase } = locals;
    if (!user) {
      console.log('❌ No user in request');
      return json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('📄 File received:', file?.name || 'No file');

    if (!file || file.size === 0 || !pageId) {
      console.log('❌ Missing file or pageId');
      return json(
        { success: false, message: 'File and pageId are required' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      return json({ success: false, message: 'Invalid file type' }, { status: 400 });
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      console.log('❌ File too large:', file.size);
      return json({ success: false, message: 'File too large' }, { status: 400 });
    }

    console.log('=============================================');
    console.log('📸 IMAGE RECEIVED ON /api/upload-markdown-image');
    console.log('=============================================');
    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', `${(file.size / 1024).toFixed(2)} KB`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('=============================================');

    // Upload to storage (using existing public bucket "projects")
    const objectPath = `coach-pages/${pageId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('projects')
      .upload(objectPath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Failed to upload image:', uploadError);
      return json({ success: false, message: 'Error uploading image' }, { status: 500 });
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('projects').getPublicUrl(objectPath);

    // Fetch existing images array on the page
    const { data: pageData, error: fetchError } = await supabase
      .from('coach_pages')
      .select('images')
      .eq('id', pageId)
      .single();

    if (fetchError) {
      console.error('❌ Failed to read page images:', fetchError);
      return json({ success: false, message: 'Error reading page' }, { status: 500 });
    }

    const existingImages = Array.isArray(pageData?.images) ? pageData.images : [];
    const updatedImages = [...existingImages, publicUrl];

    const { error: updateError } = await supabase
      .from('coach_pages')
      .update({ images: updatedImages })
      .eq('id', pageId);

    if (updateError) {
      console.error('❌ Failed to update page images:', updateError);
      return json({ success: false, message: 'Error saving image' }, { status: 500 });
    }

    console.log('✅ Stored image URL on page');
    return json({
      success: true,
      url: publicUrl,
      fileName: file.name
    });
  } catch (err) {
    console.error('💥 ERROR in /api/upload-markdown-image:', err);
    return json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Error uploading image'
      },
      { status: 500 }
    );
  }
};
