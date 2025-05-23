<script lang="ts">
  import AddToMap from '$components/AddToMap.svelte';
  import MarkdownEditor from '$components/MarkdownEditor.svelte';

  const { data, form } = $props();
  const { 
    id, 
    name, 
    profile_image_url, 
    hero_img, 
    gallery_image_urls, 
    whatsapp_number, 
    tags, 
    categories, 
    project_info, 
    country_flag, 
    location 
  } = data.project_info;
  
  console.log(data.project_info)
  
  interface LocationEvent {
    detail: {
      lng: number;
      lat: number;
    }
  }
  
  let showModal = false;
  
  // initialize with existing location
  let selectedLocation: { lng: number; lat: number } | null = null;
  if (location) {
    const [lng, lat] = location.split(',').map(Number);
    selectedLocation = { lng, lat };
  }
  
  // initialize with existing data
  let teacherInfo = project_info;
  let nameValue = name;
  let tagsValue = tags.join(', ');
  let categoriesValue = categories.join(', ');

  function handleTeacherInfoChange(content: string) {
    teacherInfo = content;
  }
</script>

<main class="w-full antialiased">
    
  <section class="bg-white dark:bg-gray-900">
    <div class="bg-[url('/images/valle.jpg')] bg-no-repeat bg-cover bg-center bg-gray-700 bg-blend-multiply">
      <div class="max-w-screen-sm px-4 mx-auto text-center pb-24 lg:pb-32 pt-20 sm:pt-24 lg:pt-32">
        <h2 class="mb-4 text-3xl font-extrabold tracking-tigh text-white sm:text-4xl">Editar Perfil del Proyecto</h2>
        <p class="text-gray-400 sm:text-xl">Actualiza la información del proyecto para mejorar la experiencia de los visitantes.</p>
      </div>
    </div>
  
    <div class="max-w-screen-xl px-4 py-16 mx-auto -mt-[11rem] sm:py-24">
      
      <!-- success/error messages -->
      {#if form?.success}
        <div class="max-w-2xl mx-auto mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p class="font-medium">¡Éxito!</p>
          <p>{form.message || 'Proyecto actualizado correctamente'}</p>
        </div>
      {/if}
      
      {#if form?.error}
        <div class="max-w-2xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p class="font-medium">Error</p>
          <p>{form.message || 'Hubo un problema al actualizar el proyecto'}</p>
        </div>
      {/if}
      
      <form action="?/updateProfile" method="POST" class="grid max-w-2xl grid-cols-1 gap-6 p-6 mx-auto mb-16 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700" enctype="multipart/form-data">
        
        <!-- project id hidden input -->
        <input type="hidden" name="project_id" value={id} />
        
        <!-- profile image -->
        <div>
          <label for="profile_image" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Foto de Perfil o Logo</label>
          {#if profile_image_url}
            <div class="mb-2">
              <img src={profile_image_url} alt="current profile" class="w-20 h-20 rounded-full object-cover" />
              <p class="text-sm text-gray-500">imagen actual</p>
            </div>
          {/if}
          <input 
            type="file" 
            id="profile_image" 
            name="profile_image"
            accept="image/*"
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" 
          />
        </div>

        <!-- hero image -->
        <div>
          <label for="hero_image" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Imagen Principal (Hero)</label>
          {#if hero_img}
            <div class="mb-2">
              <img src={hero_img} alt="current hero" class="w-32 h-20 rounded object-cover" />
              <p class="text-sm text-gray-500">imagen actual</p>
            </div>
          {/if}
          <input 
            type="file" 
            id="hero_image" 
            name="hero_image"
            accept="image/*"
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" 
          />
        </div>

        <!-- gallery images -->
        <div>
          <label for="gallery_images" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Imágenes Adicionales
            <span class="text-sm text-gray-500">(máximo 5)</span>
          </label>
          {#if gallery_image_urls && gallery_image_urls.length > 0}
            <div class="mb-2 grid grid-cols-3 gap-2">
              {#each gallery_image_urls as img}
                <img src={img} alt="gallery" class="w-full h-20 rounded object-cover" />
              {/each}
              <p class="text-sm text-gray-500 col-span-3">imágenes actuales</p>
            </div>
          {/if}
          <input 
            type="file" 
            id="gallery_images" 
            name="gallery_images"
            accept="image/*"
            multiple
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" 
          />
          <p class="mt-1 text-sm text-gray-500">formatos aceptados: jpg, png, gif</p>
        </div>

        <!-- name -->
        <div>
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre del Proyecto</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            value={nameValue}
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            required
          />
        </div>

        <!-- whatsapp number -->
        <div>
          <label for="whatsapp_number" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Número de WhatsApp</label>
          <input 
            type="text" 
            id="whatsapp_number" 
            name="whatsapp_number"
            value={whatsapp_number || ''}
            placeholder="+51987654321"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
          />
        </div>

        <!-- location hidden inputs -->
        {#if selectedLocation}
          <input type="hidden" name="location_lng" value={selectedLocation.lng} />
          <input type="hidden" name="location_lat" value={selectedLocation.lat} />
        {/if}

        <!-- tags -->
        <div>
          <label for="tags" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Etiquetas (separadas por comas)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags"
            value={tagsValue}
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            placeholder="ecoturismo, aventura, naturaleza"
          />
        </div>

        <!-- categories -->
        <div>
          <label for="categories" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Categorías (separadas por comas)</label>
          <input 
            type="text" 
            id="categories" 
            name="categories"
            value={categoriesValue}
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            placeholder="turismo, cultura, gastronomía"
          />
        </div>

        <!-- project info -->
        <div>
          <label for="project_info" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Información del Proyecto</label>
          <MarkdownEditor 
            value={teacherInfo} 
            onChange={handleTeacherInfoChange} 
          />
          <input type="hidden" name="project_info" value={teacherInfo} />
        </div>

        <!-- country flag -->
        <div>
          <label for="country_flag" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bandera del País</label>
          <input 
            type="text" 
            id="country_flag"
            name="country_flag"
            value={country_flag || ''}
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            placeholder="🇵🇪"
          />
        </div>

        <!-- location status indicator -->
        <div class="flex items-center">
          <div class={`w-4 h-4 rounded-full mr-2 ${selectedLocation ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span class="text-sm text-gray-600">
            {selectedLocation ? 'Ubicación seleccionada' : 'Ubicación no seleccionada'}
          </span>
        </div>

        <button type="submit" class="px-5 mx-auto py-3 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300">
          Guardar Cambios
        </button>

        <!-- add location button -->
        <button 
          type="button" 
          on:click={() => showModal = true}
          class="px-5 mx-auto py-3 text-sm font-medium text-center text-white rounded-lg bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300"
        >
          {selectedLocation ? 'Cambiar Ubicación' : 'Agregar Ubicación'}
        </button>
      </form>

      <AddToMap 
        showModal={showModal} 
        on:locationSelected={(e: LocationEvent) => {
          selectedLocation = e.detail;
          console.log('Location selected:', e.detail);
        }}
        on:closeModal={() => showModal = false}
      />
    </div>
  </section>
</main>