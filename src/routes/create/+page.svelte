<script lang="ts">
  import AddToMap from '$components/AddToMap.svelte';
  import MarkdownEditor from '$components/MarkdownEditor.svelte';

  const { form } = $props();
  
  interface LocationEvent {
    detail: {
      lng: number;
      lat: number;
    }
  }
  
  let showModal = $state(false);
  let selectedLocation = $state<{ lng: number; lat: number } | null>(null);
  let projectInfo = $state('');
  let isSubmitting = $state(false);

  function handleProjectInfoChange(content: string) {
    projectInfo = content;
  }
  
  // Reset submission state when form response comes back
  $effect(() => {
    if (form) {
      isSubmitting = false;
    }
  });
  
  // Debug effect to track selectedLocation changes
  $effect(() => {
    console.log('selectedLocation reactive effect triggered:', selectedLocation);
  });
  
  function handleFormSubmit(event: Event) {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Basic validation
    const name = formData.get('name')?.toString()?.trim();
    if (!name || name.length < 3) {
      alert('El nombre del proyecto debe tener al menos 3 caracteres');
      event.preventDefault();
      return false;
    }
    
    // Prevent double submission
    if (isSubmitting) {
      event.preventDefault();
      return false;
    }
    
    isSubmitting = true;
    
    // Debug logging for location data
    console.log('Form submitting with data:', {
      name,
      location: selectedLocation,
      projectInfo: projectInfo.length,
      locationLng: formData.get('location_lng'),
      locationLat: formData.get('location_lat')
    });
    
    // The form will submit normally after this
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
      
      <form action="?/createProfile" method="POST" class="grid max-w-2xl grid-cols-1 gap-6 p-6 mx-auto mb-16 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700" enctype="multipart/form-data" onsubmit={handleFormSubmit}>
        
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
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">nombre del proyecto *</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
            required
            minlength="3"
            maxlength="100"
            placeholder="Ej: Mi proyecto de ecoturismo"
          />
          <p class="mt-1 text-xs text-gray-500">Mínimo 3 caracteres, máximo 100</p>
        </div>

        <!-- whatsapp number -->
        <div>
          <label for="whatsapp_number" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">número de whatsapp</label>
          <input 
            type="tel" 
            id="whatsapp_number" 
            name="whatsapp_number"
            placeholder="+51987654321"
            pattern="[+]?[0-9\s\-\(\)]+"
            class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500" 
          />
          <p class="mt-1 text-xs text-gray-500">Incluye el código de país (ej: +51)</p>
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

        <!-- project info -->
        <div>
          <label for="project_info" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">información del proyecto</label>
          <MarkdownEditor 
            value={projectInfo} 
            onChange={handleProjectInfoChange} 
          />
          <input type="hidden" name="project_info" value={projectInfo} />
        </div>

        <!-- location status indicator -->
        <div class="flex items-center">
          <div class={`w-4 h-4 rounded-full mr-2 ${selectedLocation ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span class="text-sm text-gray-600">
            {#if selectedLocation}
              ubicación seleccionada: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            {:else}
              ubicación no seleccionada
            {/if}
          </span>
        </div>

        <!-- add location button -->
        <button 
          type="button" 
          onclick={() => showModal = true}
          class="px-5 mx-auto py-3 text-sm font-medium text-center text-white rounded-lg bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300">

          {selectedLocation ? 'cambiar ubicación' : 'agregar ubicación'}
        </button>

        <button type="submit" class="px-5 mx-auto py-3 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={isSubmitting}>
          {isSubmitting ? 'Creando proyecto...' : 'crear proyecto'}
        </button>

      </form>

      <AddToMap 
        showModal={showModal} 
        on:locationSelected={(e: LocationEvent) => {
          console.log('Location selected event received:', e.detail);
          selectedLocation = e.detail;
          console.log('selectedLocation updated to:', selectedLocation);
        }}
        on:closeModal={() => showModal = false}
      />
    </div>
  </section>
</main>
