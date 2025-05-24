<script>
  import UserInfo from '$components/UserInfo.svelte'
  import Map from '$components/Map.svelte'

  let { data } = $props();
  const { project } = data;

</script>

  <!-- hero section -->
  <div class="relative mb-8">
    <div class="left-0 right-0 bg-gradient-to-t from-black/70">
      <img src={project.hero_img || project.profile_image_url || "/images/valle.jpg"}
        alt={project.name} class="w-full h-64 md:h-96 object-cover shadow-lg" />
    </div>

    <div class="fixed top-0 left-0 right-0 p-0 text-center backdrop-blur-sm border-b-1 border-white/20">
      <div class="flex flex-wrap p-5 items-center justify-center mt-2 ">
          <img src={project.profile_image_url} alt={project.name} class="w-20 h-20 mr-2 rounded-full" />
        <div class="flex flex-col justify-start ml-2 text-shadow-lg">
          <h1 class="text-2xl md:text-3xl font-bold text-white">{project.name}</h1>
          <span class="text-white text-left">{project.location || ''}</span>
        </div>
      </div>
    </div>
  </div>

<div class="container mx-auto px-4 bg-beige min-h-screen">

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
              <span class="px-3 py-1 bg-blue-100 text-gray-800 rounded-full text-sm">{tag}</span>
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
      <!-- call to action btn for whatsapp -->
      <div class="bg-green-300 shadow rounded-xl overflow-hidden">
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-3">Contact us</h3>
          <p class="text-gray-700 mb-3">We're here to help you with any questions or concerns you may have.</p>
          <div class="flex items-center">
            <a href={`https://wa.me/${project.whatsapp_number}`} class="flex items-center px-4 py-2 bg-white text-black rounded-lg">
              <img src="/icons/whatsapp.svg" alt="WhatsApp" class="w-5 h-5 mr-2" />
              Contact us
            </a>
          </div>
        </div>
        <div class=" h-11 py-3 z-10 bottom-[-27.2rem] left-0 right-0  backdrop-blur-md p-4 bg-[url('/images/astro-pattern-color.svg')] bg-center bg-repeat"></div>
      </div>
      
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
    <!-- <div class="absolute mt-[11rem] h-11 py-3 bottom-[-27.2rem] left-0 right-0  backdrop-blur-md p-4 bg-[url('/images/astro-pattern-color.svg')] bg-center bg-repeat"></div> -->
    </div>
</div>