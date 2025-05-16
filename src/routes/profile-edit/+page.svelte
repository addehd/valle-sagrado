<script lang="ts">
  import AddToMap from '$components/AddToMap.svelte';
  
  interface LocationEvent {
    detail: {
      lng: number;
      lat: number;
    }
  }
  
  let showModal = false;
  let selectedLocation: { lng: number; lat: number } | null = null;
</script>

<main class="w-full antialiased">
    
  <section class="bg-white dark:bg-gray-900">
    <div class="bg-[url('images/valle.jpg')] bg-no-repeat bg-cover bg-center bg-gray-700 bg-blend-multiply">
      <div class="max-w-screen-sm px-4 mx-auto text-center pb-24 lg:pb-32 pt-20 sm:pt-24 lg:pt-32">
        <h2 class="mb-4 text-3xl font-extrabold tracking-tigh text-white sm:text-4xl">Editar Perfil del valle</h2>
        <p class="text-gray-400 sm:text-xl">Actualiza la información de tu perfil de enseñanza para ayudar a los estudiantes a encontrarte.</p>
      </div>
    </div>
  
    <div class="max-w-screen-xl px-4 py-16 mx-auto -mt-[11rem] sm:py-24">
      <form action="?/updateProfile" method="POST" class="grid max-w-2xl grid-cols-1 gap-6 p-6 mx-auto mb-16 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700" enctype="multipart/form-data">
        <!-- profile image -->
        <div>
          <label for="profile_image" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Foto de Perfil o logo</label>
          <input 
            type="file" 
            id="profile_image" 
            name="profile_image"
            accept="image/*"
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" 
          />
        </div>

        <!-- gallery images -->
        <div>
          <label for="gallery_images" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Imágenes adicionales
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
          <p class="mt-1 text-sm text-gray-500">formatos aceptados: jpg, png, gif</p>
        </div>

        <!-- name -->
        <div>
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre Completo</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            required
          >
        </div>

        <!-- location hidden inputs -->
        {#if selectedLocation}
          <input type="hidden" name="location_lng" value={selectedLocation.lng}>
          <input type="hidden" name="location_lat" value={selectedLocation.lat}>
        {/if}

        <!-- tags -->
        <div>
          <label for="tags" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Etiquetas (separadas por comas)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            placeholder="música, piano, teoría"
          >
        </div>

        <!-- teacher info -->
        <div>
          <label for="teacher_info" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Acerca de Ti</label>
          <textarea 
            id="teacher_info" 
            name="teacher_info"
            rows="4"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            placeholder="Cuéntale a los estudiantes sobre tu experiencia y estilo de enseñanza..."
          ></textarea>
        </div>

        <!-- teaches in -->
        <div>
          <label for="teaches_in" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Asignaturas que Enseñas</label>
          <input 
            type="text" 
            id="teaches_in"
            name="teaches_in"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            placeholder="¿Qué asignaturas enseñas?" >
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
          Agregar Ubicación
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

<div class="w-full h-[400px] rounded-lg overflow-hidden">
  <div bind:this={mapContainer} class="w-full h-full"></div>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>