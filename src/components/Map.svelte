<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import '@maptiler/sdk/dist/maptiler-sdk.css'
  
  // define teacher type
  type Teacher = {
    id: string | number;
    name: string;
    location: string | { coordinates?: [number, number]; longitude?: number; latitude?: number };
  }
  
  // props
  export let teachers: Teacher[] = [];
  export let initialCenter = { lng: -71.9675, lat: -13.5319 };
  export let initialZoom = 12;
  export let apiKey = 'Y1BdlcQrDBZP8dSBx1Wn';
  
  let map;
  let mapContainer;
  let Map;
  let MapStyle;
  let Marker;
  let config;

  const createCustomMarker = (teacher) => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="bg-brown-500 border border-white border-[0.5px] p-2 px-4 flex flex-row items-center justify-center rounded-full shadow-lg">
        <a href="/profile?teacher_id=${teacher.id}" class="text-white text-xs font-bold">${teacher.name || 'T'}</a>
        <img src="/icons/math.svg" class="ml-2 w-5 h-5 filter brightness-0 invert" />
      </div>
    `;
    return el;
  };

  const parseLocation = (location) => {
    if (!location) return null;
    
    if (typeof location === 'string') {
      const [lng, lat] = location.split(',').map(coord => parseFloat(coord.trim()));
      return [lng, lat];
    }
    
    if (typeof location === 'object') {
      return location.coordinates || [location.longitude, location.latitude] || null;
    }
    
    return null;
  };

  onMount(async () => {
    if (browser) {
      const sdk = await import('@maptiler/sdk')
      Map = sdk.Map
      MapStyle = sdk.MapStyle
      Marker = sdk.Marker
      config = sdk.config
      
      config.apiKey = apiKey;

      map = new Map({
        container: mapContainer,
        style: MapStyle.STREETS,
        center: [initialCenter.lng, initialCenter.lat],
        zoom: initialZoom
      });

      teachers.forEach(teacher => {
        if (teacher.location) {
          const coordinates = parseLocation(teacher.location);
          
          if (coordinates) {
            new Marker({ 
              element: createCustomMarker(teacher),
              anchor: 'bottom'
            })
              .setLngLat(coordinates)
              .addTo(map);
          }
        }
      });
    }
  });

  onDestroy(() => {
    if (map) map.remove();
  });
</script>

<div class="relative w-full h-full">
  <div class="absolute w-full h-full" bind:this={mapContainer}></div>
</div> 