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
  updateProfile: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    
    try {
      // get form data
      const projectId = formData.get('project_id')?.toString()
      const name = formData.get('name')?.toString()
      const countryFlag = formData.get('country_flag')?.toString()
      const tags = formData.get('tags')?.toString().split(',').map(tag => tag.trim()).filter(tag => tag)
      const categories = formData.get('categories')?.toString().split(',').map(cat => cat.trim()).filter(cat => cat)
      const projectInfo = formData.get('project_info')?.toString()
      const whatsappNumber = formData.get('whatsapp_number')?.toString()
      const locationLng = formData.get('location_lng')?.toString()
      const locationLat = formData.get('location_lat')?.toString()
      
      // get images
      const profileImage = formData.get('profile_image') as File
      const heroImage = formData.get('hero_image') as File
      const galleryImages = formData.getAll('gallery_images') as File[]
      
      let profileImageUrl = null
      let heroImageUrl = null
      const galleryImageUrls: string[] = []

      // upload profile image if provided
      if (profileImage?.size > 0) {
        const fileExt = profileImage.name.split('.').pop()
        const filePath = `profile-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
        
        const { error: storageError } = await supabase.storage
          .from('projects')
          .upload(filePath, profileImage)
        
        if (!storageError) {
          const { data: publicUrlData } = supabase.storage
            .from('projects')
            .getPublicUrl(filePath)
          profileImageUrl = publicUrlData.publicUrl
        }
      }

      // upload hero image if provided
      if (heroImage?.size > 0) {
        const fileExt = heroImage.name.split('.').pop()
        const filePath = `hero-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
        
        const { error: storageError } = await supabase.storage
          .from('projects')
          .upload(filePath, heroImage)
        
        if (!storageError) {
          const { data: publicUrlData } = supabase.storage
            .from('projects')
            .getPublicUrl(filePath)
          heroImageUrl = publicUrlData.publicUrl
        }
      }

      // upload gallery images
      for (const image of galleryImages) {
        if (image.size > 0) {
          const fileExt = image.name.split('.').pop()
          const filePath = `gallery-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
          
          const { error: storageError } = await supabase.storage
            .from('projects')
            .upload(filePath, image)
          
          if (!storageError) {
            const { data: publicUrlData } = supabase.storage
              .from('projects')
              .getPublicUrl(filePath)
            galleryImageUrls.push(publicUrlData.publicUrl)
          }
        }
      }

      // prepare update data
      const updateData: any = {
        name, 
        country_flag: countryFlag, 
        tags, 
        categories,
        project_info: projectInfo,
        whatsapp_number: whatsappNumber
      }

      // add images if uploaded
      if (profileImageUrl) updateData.profile_image_url = profileImageUrl
      if (heroImageUrl) updateData.hero_img = heroImageUrl
      if (galleryImageUrls.length > 0) updateData.gallery_image_urls = galleryImageUrls
      if (locationLng && locationLat) updateData.location = `${locationLng},${locationLat}`

      // update the project
      const { data, error } = await supabase
        .from('projects_info')
        .update(updateData)
        .eq('id', projectId)
        .select('url')
        .single()

      if (error) throw error

      return {
        success: true,
        message: 'Proyecto actualizado exitosamente'
      }

    } catch (error) {
      console.error('Error updating project:', error)
      return fail(500, {
        error: true,
        message: 'Error al actualizar el proyecto'
      })
    }
  }
} satisfies Actions
