import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions = {
  createProfile: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    
    try {
      // get form data
      const name = formData.get('name')?.toString()
      const country = formData.get('country')?.toString()
      const tags = formData.get('tags')?.toString().split(',').map(tag => tag.trim()).filter(tag => tag)
      const categories = formData.get('categories')?.toString().split(',').map(cat => cat.trim()).filter(cat => cat)
      const projectInfo = formData.get('project_info')?.toString()
      const whatsappNumber = formData.get('whatsapp_number')?.toString()
      const locationLng = formData.get('location_lng')?.toString()
      const locationLat = formData.get('location_lat')?.toString()
      
      // generate url slug from name
      const url = name?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .replace(/\s+/g, '-') // replace spaces with dashes
        .replace(/-+/g, '-') // replace multiple dashes with single dash
        .trim()
      
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

      // prepare insert data
      const insertData: any = {
        name,
        url,
        country_flag: country, 
        tags, 
        categories,
        project_info: projectInfo,
        whatsapp_number: whatsappNumber
      }

      // add images if uploaded
      if (profileImageUrl) insertData.profile_image_url = profileImageUrl
      if (heroImageUrl) insertData.hero_img = heroImageUrl
      if (galleryImageUrls.length > 0) insertData.gallery_image_urls = galleryImageUrls
      if (locationLng && locationLat) insertData.location = `${locationLng},${locationLat}`

      console.log('Insert data:', insertData)

      // insert the new project
      const { error } = await supabase
        .from('projects_info')
        .insert(insertData)

      if (error) {
        console.error('Database insert error:', error)
        throw error
      }

      console.log('Project inserted successfully')
      return {
        success: true,
        message: 'proyecto creado exitosamente'
      }

    } catch (error) {
      console.error('Error creating project:', error)
      return fail(500, {
        error: true,
        message: `Error al crear el proyecto: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }
} satisfies Actions
