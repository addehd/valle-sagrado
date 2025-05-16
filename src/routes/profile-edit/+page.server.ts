import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const actions = {
  updateProfile: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    
    try {
      // get form data
      const name = formData.get('name')?.toString()
      const countryFlag = formData.get('country_flag')?.toString() || null
      const tags = formData.get('tags')?.toString().split(',').map(tag => tag.trim()) || null
      const teacherInfo = formData.get('teacher_info')?.toString() || null
      const teachesIn = formData.get('teaches_in')?.toString() || null
      
      // get location data
      const locationLng = formData.get('location_lng')?.toString() || null
      const locationLat = formData.get('location_lat')?.toString() || null
      
      // get profile image
      const profileImage = formData.get('profile_image') as File | null
      let profileImageUrl = null

      // get gallery images
      const galleryImages = formData.getAll('gallery_images') as File[]
      const galleryImageUrls: string[] = []

      // validate required fields
      if (!name) {
        return fail(400, { 
          error: true, 
          message: 'El nombre es obligatorio',
          values: { name, countryFlag, tags, teacherInfo, teachesIn }
        })
      }

      // upload profile image if provided
      if (profileImage instanceof File) {
        const fileExt = profileImage.name.split('.').pop()
        const filePath = `profile-images/${Date.now()}.${fileExt}`
        
        const { error: storageError } = await supabase.storage
          .from('teacher')
          .upload(filePath, profileImage, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (storageError) {
          console.error('Error uploading profile image:', storageError)
          return fail(500, {
            error: true,
            message: 'Error al subir la imagen de perfil'
          })
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('teacher')
          .getPublicUrl(filePath)
        
        profileImageUrl = publicUrlData.publicUrl
      }

      // upload gallery images
      for (const image of galleryImages) {
        if (image instanceof File) {
          const fileExt = image.name.split('.').pop()
          // create unique filename using timestamp and random string
          const filePath = `gallery-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
          
          const { error: storageError } = await supabase.storage
            .from('teacher')
            .upload(filePath, image, {
              cacheControl: '3600',
              upsert: false
            })
          
          if (storageError) {
            console.error('Error uploading gallery image:', storageError)
            continue // skip failed uploads but continue with others
          }
          
          const { data: publicUrlData } = supabase.storage
            .from('teacher')
            .getPublicUrl(filePath)
          
          galleryImageUrls.push(publicUrlData.publicUrl)
        }
      }

      // update database using supabase
      const teacherData = {
        name, 
        country_flag: countryFlag, 
        tags, 
        teacher_info: teacherInfo, 
        teaches_in: teachesIn,
        profile_image_url: profileImageUrl,
        gallery_image_urls: galleryImageUrls
      }

      // Format location as a string with the coordinates
      if (locationLng && locationLat) {
        // Store as a string in the format "lng,lat"
        teacherData.location = `${locationLng},${locationLat}`;
      }

      const { data, error } = await supabase
        .from('teachers')
        .insert(teacherData)
        .select('id')
        .single()

      if (error) throw error

      return {
        success: true,
        teacherId: data.id
      }

    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      return fail(500, {
        error: true,
        message: 'Error al actualizar el perfil. Por favor intenta de nuevo.'
      })
    }
  }
} satisfies Actions
