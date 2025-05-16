<script>
  import UserInfo from '$components/UserInfo.svelte'
  import Map from '$components/Map.svelte'

  let { data } = $props();
  const { project } = data;

  // const userInfoProps = {
  //   name: teacher.name,
  //   teacher_info: teacher.teacher_info, 
  //   countryFlag: teacher.country_flag,
  //   subjectText: teacher.teaches_in ? `Teaches in ${teacher.teaches_in}` : 'Teaches',
  //   profile_image_url: teacher.profile_image_url,
  //   location: teacher.location,
  //   gallery_image_urls: teacher.gallery_image_urls,
  //   tags: teacher.tags
  // };

  // const callToActionProps = {
  //   name: teacher.name,
  //   youtube_url: teacher.youtube_url || '',
  //   product_url: data.products?.[0]?.url || '',
  //   products: data.products
  // };

  // function parseLocation(location) {
  //   if (location) {
  //     const parts = location.split(',');
  //     if (parts.length === 2) {
  //       const lng = parseFloat(parts[0]);
  //       const lat = parseFloat(parts[1]);
  //       if (!isNaN(lng) && !isNaN(lat)) {
  //         return [lng, lat];
  //       }
  //     }
  //   }
  //   return null;
  // }

</script>

<div class="container mx-auto px-4 py-8">
  <!-- hero section -->
  <div class="relative mb-8">
    <img 
      src={project.hero_img || project.profile_image_url || "/images/valle.jpg"} 
      alt={project.name} 
      class="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
    />
    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-6">
      <h1 class="text-3xl md:text-4xl font-bold text-white">{project.name}</h1>
      {#if project.country_flag}
        <div class="flex items-center mt-2">
          <img src={project.country_flag} alt="Country flag" class="w-6 h-4 mr-2" />
          <span class="text-white">{project.location || ''}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- main content -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- left column - info -->
    <div class="lg:col-span-2 space-y-6">
      <!-- project info -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold mb-4">About this project</h2>
        <p class="text-gray-700">{project.project_info || 'No information available'}</p>
      </div>
      
      <!-- tags -->
      {#if project.tags && project.tags.length > 0}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">Tags</h3>
          <div class="flex flex-wrap gap-2">
            {#each project.tags as tag}
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{tag}</span>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- gallery -->
      {#if project.gallery_image_urls && project.gallery_image_urls.length > 0}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">Gallery</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            {#each project.gallery_image_urls as img}
              <img src={img} alt="Gallery image" class="w-full h-32 object-cover rounded-lg" />
            {/each}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- right column - map & categories -->
    <div class="space-y-6">
      <!-- categories -->
      {#if project.categories && project.categories.length > 0}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">Categories</h3>
          <div class="space-y-2">
            {#each project.categories as category}
              <div class="px-3 py-2 bg-gray-100 rounded-lg">{category}</div>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- map -->
      {#if project.location}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">Location</h3>
          <div class="h-64 bg-gray-100 rounded-lg">
            <Map projects={[project]} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>