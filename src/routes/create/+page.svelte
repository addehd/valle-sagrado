<script lang="ts">
  import AddToMap from '$components/AddToMap.svelte';
  import MarkdownEditor from '$components/MarkdownEditor.svelte';

  const { form } = $props();
  
  // country list with codes and names
  const countries = [
    { code: 'pe', name: 'Perú' },
    { code: 'ar', name: 'Argentina' },
    { code: 'bo', name: 'Bolivia' },
    { code: 'br', name: 'Brasil' },
    { code: 'cl', name: 'Chile' },
    { code: 'co', name: 'Colombia' },
    { code: 'ec', name: 'Ecuador' },
    { code: 'gy', name: 'Guyana' },
    { code: 'py', name: 'Paraguay' },
    { code: 'sr', name: 'Suriname' },
    { code: 'uy', name: 'Uruguay' },
    { code: 've', name: 'Venezuela' },
    { code: 'mx', name: 'México' },
    { code: 'gt', name: 'Guatemala' },
    { code: 'bz', name: 'Belice' },
    { code: 'sv', name: 'El Salvador' },
    { code: 'hn', name: 'Honduras' },
    { code: 'ni', name: 'Nicaragua' },
    { code: 'cr', name: 'Costa Rica' },
    { code: 'pa', name: 'Panamá' },
    { code: 'es', name: 'España' },
    { code: 'us', name: 'Estados Unidos' },
    { code: 'ca', name: 'Canadá' },
    { code: 'fr', name: 'Francia' },
    { code: 'de', name: 'Alemania' },
    { code: 'it', name: 'Italia' },
    { code: 'pt', name: 'Portugal' },
    { code: 'uk', name: 'Reino Unido' },
    { code: 'se', name: 'Suecia' },
    { code: 'no', name: 'Noruega' },
    { code: 'dk', name: 'Dinamarca' },
    { code: 'fi', name: 'Finlandia' },
    { code: 'nl', name: 'Países Bajos' },
    { code: 'be', name: 'Bélgica' },
    { code: 'ch', name: 'Suiza' },
    { code: 'at', name: 'Austria' },
    { code: 'jp', name: 'Japón' },
    { code: 'cn', name: 'China' },
    { code: 'kr', name: 'Corea del Sur' },
    { code: 'au', name: 'Australia' },
    { code: 'nz', name: 'Nueva Zelanda' }
  ];
  
  interface LocationEvent {
    detail: {
      lng: number;
      lat: number;
    }
  }
  
  let showModal = false;
  let selectedLocation: { lng: number; lat: number } | null = null;
  let projectInfo = '';

  function handleProjectInfoChange(content: string) {
    projectInfo = content;
  }
</script>

<main class="w-full antialiased">
  <section class="bg-white dark:bg-gray-900">
    <div class="bg-[url('/images/valle.jpg')] bg-no-repeat bg-cover bg-center bg-gray-700 bg-blend-multiply">
      <div class="max-w-screen-sm px-4 mx-auto text-center pb-24 lg:pb-32 pt-20 sm:pt-24 lg:pt-32">
        <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Crear Nuevo Proyecto</h2>
        <p class="text-gray-400 sm:text-xl">crea un nuevo proyecto para compartir con la comunidad.</p>
      </div>
    </div>
  
    <div class="max-w-screen-xl px-4 py-16 mx-auto -mt-[11rem] sm:py-24">
      
      <!-- success/error messages -->
      {#if form?.success}
        <div class="max-w-2xl mx-auto mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p class="font-medium">¡Éxito!</p>
          <p>{form.message || 'proyecto creado correctamente'}</p>
        </div>
      {/if}
      
      {#if form?.error}
        <div class="max-w-2xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p class="font-medium">error</p>
          <p>{form.message || 'hubo un problema al crear el proyecto'}</p>
        </div>
      {/if}
      
      <form action="?/createProfile" method="POST" class="grid max-w-2xl grid-cols-1 gap-6 p-6 mx-auto mb-16 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700" enctype="multipart/form-data">
        
        <!-- profile image -->
        <div>
          <label for="profile_image" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">foto de perfil o logo</label>
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
          <label for="hero_image" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">imagen principal</label>
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
            imágenes adicionales
            <span class="text-sm text-gray-500">(máximo 5)</span>
          </label>
          <input 
            type="file" 
            id="gallery_images" 
            name="gallery_images"
            accept="image/*"
            multiple
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" 
          />
        </div>

        <!-- name -->
        <div>
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">nombre del proyecto</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            required
          />
        </div>

        <!-- whatsapp number -->
        <div>
          <label for="whatsapp_number" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">número de whatsapp</label>
          <input 
            type="text" 
            id="whatsapp_number" 
            name="whatsapp_number"
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
          <label for="tags" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">etiquetas (separadas por comas)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            placeholder="ecoturismo, aventura, naturaleza"
          />
        </div>

        <!-- categories -->
        <div>
          <label for="categories" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">categorías (separadas por comas)</label>
          <input 
            type="text" 
            id="categories" 
            name="categories"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            placeholder="turismo, cultura, gastronomía"
          />
        </div>

        <!-- project info -->
        <div>
          <label for="project_info" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">información del proyecto</label>
          <MarkdownEditor 
            value={projectInfo} 
            onChange={handleProjectInfoChange} 
          />
          <input type="hidden" name="project_info" value={projectInfo} />
        </div>

        <!-- country -->
        <div>
          <label for="country" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">país</label>
          <select 
            id="country"
            name="country"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">selecciona un país</option>
            {#each countries as country}
              <option value={country.code}>{country.name}</option>
            {/each}
          </select>
        </div>

        <!-- location status indicator -->
        <div class="flex items-center">
          <div class={`w-4 h-4 rounded-full mr-2 ${selectedLocation ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span class="text-sm text-gray-600">
            {selectedLocation ? 'ubicación seleccionada' : 'ubicación no seleccionada'}
          </span>
        </div>

        <button type="submit" class="px-5 mx-auto py-3 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300">
          crear proyecto
        </button>

        <!-- add location button -->
        <button 
          type="button" 
          on:click={() => showModal = true}
          class="px-5 mx-auto py-3 text-sm font-medium text-center text-white rounded-lg bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300"
        >
          {selectedLocation ? 'cambiar ubicación' : 'agregar ubicación'}
        </button>
      </form>

      <AddToMap 
        showModal={showModal} 
        on:locationSelected={(e: LocationEvent) => {
          selectedLocation = e.detail;
        }}
        on:closeModal={() => showModal = false}
      />
    </div>
  </section>
</main>
