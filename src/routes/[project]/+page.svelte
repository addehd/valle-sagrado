<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import Products from '$components/Products.svelte';
	import UserInfo from '$components/UserInfo.svelte'
	import Map from '$components/Map.svelte'

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	
	const projectSlug = $derived($page.params.project);
</script>

  <!-- hero section -->
  <div class="relative mb-8">
    <div class="left-0 right-0 bg-gradient-to-t from-black/70">
      <img src={data.project?.hero_img || data.project?.profile_image_url || "/images/valle.jpg"}
        alt={data.project?.name} class="w-full h-64 md:h-96 object-cover shadow-lg" />
    </div>

    <div class="fixed top-0 left-0 right-0 p-0 text-center backdrop-blur-sm border-b-1 border-white/20">
      <div class="flex flex-wrap p-5 items-center justify-center mt-2 ">
          <img src={data.project?.profile_image_url} alt={data.project?.name} class="w-20 h-20 mr-2 rounded-full" />
        <div class="flex flex-col justify-start ml-2 text-shadow-lg">
          <h1 class="text-2xl md:text-3xl font-bold text-white">{data.project?.name}</h1>
          <span class="text-white text-left">{data.project?.location || ''}</span>
        </div>
      </div>
    </div>
  </div>

<div class="container mx-auto px-4 bg-beige min-h-screen">

  <!-- Browse Our Offerings -->
  <div class="mt-16">
    <h2 class="text-2xl font-bold text-gray-900 mb-8">Browse Our Offerings</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Categories Card -->
      <a
        href="/{projectSlug}/categories"
        class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      >
        <div class="relative">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-4l-3 3.5M5 7l3 3.5M19 7l-3 3.5M5 11l3-3.5" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold">Browse Categories</h3>
              <p class="text-blue-100">Explore our organized product collections</p>
            </div>
          </div>
          <svg class="absolute top-2 right-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </a>

      <!-- Products Card -->
      <a
        href="/{projectSlug}/products"
        class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      >
        <div class="relative">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold">View All Products</h3>
              <p class="text-green-100">Browse our complete product catalog</p>
            </div>
          </div>
          <svg class="absolute top-2 right-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </a>
    </div>
  </div>

  <!-- Featured Products Preview -->
  {#if data.project?.featured_products && data.project.featured_products.length > 0}
    <div class="mt-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Featured Products</h2>
        <a
          href="/{projectSlug}/products"
          class="text-blue-600 hover:text-blue-800 font-medium"
        >
          View all products →
        </a>
      </div>
      
      <!-- Use Products component with minimal features for preview -->
      <Products
        products={data.project.featured_products}
        maxProducts={4}
        showFilters={false}
        showSearchBar={false}
        enableQuickFilters={false}
        showPagination={false}
        size="medium"
        sortBy="featured"
      />
    </div>
  {/if}

  <!-- main content -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- left column - info -->
    <div class="lg:col-span-2 space-y-6">
      <!-- project info -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold mb-4">About this project</h2>
        <p class="text-gray-700">{data.project?.project_info || 'No information available'}</p>
      </div>
      
      <!-- tags -->
      {#if data.project?.tags && data.project.tags.length > 0}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">Tags</h3>
          <div class="flex flex-wrap gap-2">
            {#each data.project.tags as tag}
              <span class="px-3 py-1 bg-blue-100 text-gray-800 rounded-full text-sm">{tag}</span>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- gallery -->
      {#if data.project?.gallery_image_urls && data.project.gallery_image_urls.length > 0}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">Gallery</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            {#each data.project.gallery_image_urls as img}
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
            <a href={`https://wa.me/${data.project?.whatsapp_number}`} class="flex items-center px-4 py-2 bg-white text-black rounded-lg">
              <img src="/icons/whatsapp.svg" alt="WhatsApp" class="w-5 h-5 mr-2" />
              Contact us
            </a>
          </div>
        </div>
        <div class=" h-11 py-3 z-10 bottom-[-27.2rem] left-0 right-0  backdrop-blur-md p-4 bg-[url('/images/astro-pattern-color.svg')] bg-center bg-repeat"></div>
      </div>
      
      <!-- categories -->
      {#if data.project?.categories && data.project.categories.length > 0}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">Categories</h3>
          <div class="space-y-2">
            {#each data.project.categories as category}
              <div class="px-3 py-2 bg-gray-100 rounded-lg">{category}</div>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- map -->
      {#if data.project?.location}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">Location</h3>
          <div class="h-64 bg-gray-100 rounded-lg">
            <Map teachers={[{ id: data.project?.id || data.project?.slug, name: data.project?.name, location: data.project?.location }]} />
          </div>
        </div>
      {/if}
    </div>
    <!-- <div class="absolute mt-[11rem] h-11 py-3 bottom-[-27.2rem] left-0 right-0  backdrop-blur-md p-4 bg-[url('/images/astro-pattern-color.svg')] bg-center bg-repeat"></div> -->
    </div>
</div>