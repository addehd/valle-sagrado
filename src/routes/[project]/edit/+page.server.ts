import { fail, error as svelteKitError } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
  const { data: project_info, error } = await supabase
    .from('projects_info')
    .select('*')
    .eq('url', params.project)
    .single()

  if (error) {
    throw svelteKitError(404, 'Project not found') 
  }

  return { project_info }
}

export const actions = {
  uploadImage: async ({ request, locals }) => {
    const { user, supabase } = locals;
    if (!user) {
      return fail(401, { success: false, message: 'Unauthorized' });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const pageId = formData.get('pageId')?.toString();

      if (!file || file.size === 0) {
        return fail(400, { success: false, message: 'File is required' });
      }

      if (!file.type.startsWith('image/')) {
        return fail(400, { success: false, message: 'Invalid file type' });
      }

      const MAX_SIZE = 4.5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return fail(400, { success: false, message: 'File too large (max 4.5MB)' });
      }

      // Upload to storage
      const objectPath = `markdown-images/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(objectPath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Failed to upload image:', uploadError);
        return fail(500, { success: false, message: 'Error uploading image' });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('projects')
        .getPublicUrl(objectPath);

      return {
        success: true,
        url: publicUrl,
        fileName: file.name
      };
    } catch (err) {
      console.error('Error in uploadImage:', err);
      return fail(500, {
        success: false,
        message: err instanceof Error ? err.message : 'Error uploading image'
      });
    }
  },

  updateProfile: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    
    try {
      // get form data
      const projectId = formData.get('project_id')?.toString()
      const name = formData.get('name')?.toString()
      const country = formData.get('country')?.toString()
      const tags = formData.get('tags')?.toString().split(',').map(tag => tag.trim()).filter(tag => tag)
      const categories = formData.get('categories')?.toString().split(',').map(cat => cat.trim()).filter(cat => cat)
      const projectInfo = formData.get('project_info')?.toString()
      const whatsappNumber = formData.get('whatsapp_number')?.toString()
      const locationLng = formData.get('location_lng')?.toString()
      const locationLat = formData.get('location_lat')?.toString()

      console.log('formData:', formData.get('project_info'))
      
      // get images
      const profileImage = formData.get('profile_image') as File
      const heroImage = formData.get('hero_image') as File
      const galleryImages = formData.getAll('gallery_images') as File[]
      
      let profileImageUrl = null
      let heroImageUrl = null
      const galleryImageUrls: string[] = []

      // upload profile image if provided
      if (profileImage?.size > 0) {
        console.log('Uploading profile image...')
        const fileExt = profileImage.name.split('.').pop()
        const filePath = `profile-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
        
        const { error: storageError } = await supabase.storage
          .from('teacher')
          .upload(filePath, profileImage, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (storageError) {
          console.error('Profile image upload error:', storageError)
          return fail(500, {
            error: true,
            message: `Error uploading profile image: ${storageError.message}`
          })
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('teacher')
          .getPublicUrl(filePath)
        profileImageUrl = publicUrlData.publicUrl
        console.log('Profile image uploaded successfully:', profileImageUrl)
      }

      // upload hero image if provided
      if (heroImage?.size > 0) {
        console.log('Uploading hero image...')
        const fileExt = heroImage.name.split('.').pop()
        const filePath = `hero-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
        
        const { error: storageError } = await supabase.storage
          .from('teacher')
          .upload(filePath, heroImage, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (storageError) {
          console.error('Hero image upload error:', storageError)
          return fail(500, {
            error: true,
            message: `Error uploading hero image: ${storageError.message}`
          })
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('teacher')
          .getPublicUrl(filePath)
        heroImageUrl = publicUrlData.publicUrl
        console.log('Hero image uploaded successfully:', heroImageUrl)
      }

      // upload gallery images
      for (const image of galleryImages) {
        if (image.size > 0) {
          console.log('Uploading gallery image:', image.name)
          const fileExt = image.name.split('.').pop()
          const filePath = `gallery-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
          
          const { error: storageError } = await supabase.storage
            .from('teacher')
            .upload(filePath, image, {
              cacheControl: '3600',
              upsert: true
            })
          
          if (storageError) {
            console.error('Gallery image upload error:', storageError)
            // continue with other images instead of failing completely
            continue
          }
          
          const { data: publicUrlData } = supabase.storage
            .from('teacher')
            .getPublicUrl(filePath)
          galleryImageUrls.push(publicUrlData.publicUrl)
          console.log('Gallery image uploaded successfully:', publicUrlData.publicUrl)
        }
      }

      console.log('projectInfo:', projectInfo)

      // prepare update data
      const updateData: any = {
        name, 
        country_flag: country, 
        tags, 
        categories,
        project_info: projectInfo,
        whatsapp_number: whatsappNumber
      }

      console.log('project_info in updateData:', updateData.project_info)
      console.log('typeof project_info:', typeof updateData.project_info)

      // add images if uploaded
      if (profileImageUrl) updateData.profile_image_url = profileImageUrl
      if (heroImageUrl) updateData.hero_img = heroImageUrl
      if (galleryImageUrls.length > 0) updateData.gallery_image_urls = galleryImageUrls
      if (locationLng && locationLat) updateData.location = `${locationLng},${locationLat}`

      console.log('Update data:', updateData)

      // update the project
      const { data, error } = await supabase
        .from('projects_info')
        .update(updateData)
        .eq('id', projectId)
        .select('*')
        .single()

      console.log('Database response data:', data)
      console.log('Database response error:', error)

      if (error) {
        console.error('Database update error:', error)
        throw error
      }

      console.log('Project updated successfully')
      return {
        success: true,
        message: 'Proyecto actualizado exitosamente'
      }

    } catch (error) {
      console.error('Error updating project:', error)
      return fail(500, {
        error: true,
        message: `Error al actualizar el proyecto: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }
} satisfies Actions
