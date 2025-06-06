<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import '@maptiler/sdk/dist/maptiler-sdk.css';
  
  // create dispatch for custom events
  const dispatch = createEventDispatcher<{
    locationSelected: { lng: number; lat: number }
    closeModal: void
  }>();
  
  export let showModal: boolean;
  
  let mapContainer: HTMLElement;
  let map: any;
  let marker: any = null;
  let sdk: any;
  let selectedCoordinates: { lng: number; lat: number } | null = null;
  
  // initialize map whenever modal becomes visible
  $: if (showModal && mapContainer) {
    setTimeout(initMap, 100); // small delay to ensure DOM is ready
  }
  
  async function initMap() {
    if (!browser) return;
    
    if (!sdk) {
      // import SDK dynamically (only once)
      sdk = await import('@maptiler/sdk');
    }
    
    // clean up existing map if any
    if (map) {
      map.remove();
    }
    
    const { Map, MapStyle, Marker, config } = sdk;
    
    // set API key (should be in env variables)
    config.apiKey = 'Y1BdlcQrDBZP8dSBx1Wn';
    
    // initialize map - centered on Cusco
    const initialState = { lng: -71.978771, lat: -13.516667, zoom: 13 };
    
    map = new Map({
      container: mapContainer,
      style: MapStyle.STREETS,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });
    
    map.on('load', () => {
      console.log('Map loaded');
    });
    
    // add click handler to map
    map.on('click', (e: any) => {
      console.log('Map clicked', e.lngLat);
      const { lngLat } = e;
      
      // save coordinates
      selectedCoordinates = {
        lng: lngLat.lng,
        lat: lngLat.lat
      };
      
      // remove existing marker if any
      if (marker) {
        marker.remove();
      }
      
      // add new marker
      marker = new Marker({color: "#FF0000"})
        .setLngLat(lngLat)
        .addTo(map);
      
      // Don't dispatch immediately - wait for user to confirm
      console.log('Coordinates saved locally:', selectedCoordinates);
    });
  }
  
  // cleanup on component destroy
  onDestroy(() => {
    if (map) map.remove();
  });
  
  function closeModal() {
    dispatch('closeModal');
  }
  
  function confirmLocation() {
    if (selectedCoordinates) {
      console.log('Confirming location and dispatching event:', selectedCoordinates);
      dispatch('locationSelected', selectedCoordinates);
      closeModal();
    } else {
      console.log('No coordinates selected - cannot confirm');
    }
  }
</script>

{#if showModal}
  <div class="fixed inset-0 bg-black/40 bg-opacity-90 backdrop-blur flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg w-[90vw] max-w-4xl h-[80vh] max-h-[600px] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Seleccionar Ubicación</h3>
        <button type="button" on:click={closeModal} class="text-gray-500 hover:text-gray-700 text-xl font-bold">✕</button>
      </div>
      <div class="flex-1 w-full rounded-lg overflow-hidden border">
        <div bind:this={mapContainer} class="w-full h-full"></div>
      </div>
      <p class="mt-3 text-sm text-gray-600">Haz clic en el mapa para seleccionar tu ubicación</p>
      {#if selectedCoordinates}
        <p class="text-xs text-green-600">
          Coordenadas: {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
        </p>
      {/if}
      <div class="mt-4 flex justify-end gap-2">
        <button 
          type="button" 
          on:click={closeModal}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button 
          type="button" 
          on:click={confirmLocation}
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!selectedCoordinates}
        >
          Confirmar Ubicación
        </button>
      </div>
    </div>
  </div>
{/if}
