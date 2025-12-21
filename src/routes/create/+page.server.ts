import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

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

  createProfile: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    
    try {
      // get form data with better validation
      const name = formData.get('name')?.toString()?.trim()
      const country = formData.get('country')?.toString()?.trim()
      const tagsInput = formData.get('tags')?.toString()?.trim()
      const categoriesInput = formData.get('categories')?.toString()?.trim()
      const projectInfo = formData.get('project_info')?.toString()?.trim()
      const whatsappNumber = formData.get('whatsapp_number')?.toString()?.trim()
      const locationLng = formData.get('location_lng')?.toString()?.trim()
      const locationLat = formData.get('location_lat')?.toString()?.trim()
      
      // validate required fields
      if (!name) {
        return fail(400, {
          error: true,
          message: 'El nombre del proyecto es requerido'
        })
      }
      
      // parse tags and categories safely
      const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
      const categories = categoriesInput ? categoriesInput.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0) : []
      
      // generate url slug from name with better validation
      const url = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .replace(/\s+/g, '-') // replace spaces with dashes
        .replace(/-+/g, '-') // replace multiple dashes with single dash
        .replace(/^-+|-+$/g, '') // remove leading/trailing dashes
        .trim()
      
      // validate URL isn't empty after cleaning
      if (!url) {
        return fail(400, {
          error: true,
          message: 'El nombre del proyecto debe contener al menos algunos caracteres válidos'
        })
      }
      
      // check if URL already exists
      const { data: existingProject } = await supabase
        .from('projects_info')
        .select('id')
        .eq('url', url)
        .single()
      
      if (existingProject) {
        return fail(400, {
          error: true,
          message: 'Ya existe un proyecto con un nombre similar. Por favor elige un nombre diferente.'
        })
      }
      
      // get images
      const profileImage = formData.get('profile_image') as File
      const heroImage = formData.get('hero_image') as File
      const galleryImages = formData.getAll('gallery_images') as File[]
      
      console.log('Profile image:', profileImage?.name, profileImage?.size)
      console.log('Hero image:', heroImage?.name, heroImage?.size)
      console.log('Gallery images:', galleryImages.map(img => ({ name: img.name, size: img.size })))
      
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

      // prepare insert data with better validation
      const insertData: any = {
        name,
        url,
        tags, 
        categories,
        project_info: projectInfo || null,
        whatsapp_number: whatsappNumber || null
      }

      // add country if provided
      if (country) {
        insertData.country_flag = country
      }

      // add images if uploaded
      if (profileImageUrl) insertData.profile_image_url = profileImageUrl
      if (heroImageUrl) insertData.hero_img = heroImageUrl
      if (galleryImageUrls.length > 0) insertData.gallery_image_urls = galleryImageUrls
      
      // validate and add location
      if (locationLng && locationLat) {
        const lng = parseFloat(locationLng)
        const lat = parseFloat(locationLat)
        
        // basic coordinate validation
        if (isNaN(lng) || isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          return fail(400, {
            error: true,
            message: 'Las coordenadas de ubicación no son válidas'
          })
        }
        
        insertData.location = `${lng},${lat}`
      }

      console.log('Insert data:', insertData)

      // insert the new project
      const { data, error } = await supabase
        .from('projects_info')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        
        // provide more specific error messages
        if (error.code === '23505') { // unique constraint violation
          return fail(400, {
            error: true,
            message: 'Ya existe un proyecto con ese nombre o URL'
          })
        }
        
        return fail(500, {
          error: true,
          message: `Error al crear el proyecto: ${error.message}`
        })
      }

      console.log('Project inserted successfully:', data)
      return {
        success: true,
        message: 'Proyecto creado exitosamente',
        projectUrl: url
      }

    } catch (error) {
      console.error('Error creating project:', error)
      return fail(500, {
        error: true,
        message: `Error al crear el proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    }
  }
} satisfies Actions
