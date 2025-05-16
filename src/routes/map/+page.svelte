<script>
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import '@maptiler/sdk/dist/maptiler-sdk.css'
  
  export let data;
  
  let map;
  let mapContainer;
  let Map;
  let MapStyle;
  let Marker;
  let config;

  const createCustomMarker = (teacher) => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="bg-slate-500 border border-white border-[0.5px] p-2 px-4 flex flex-row items-center justify-center rounded-full shadow-lg">
        <a href="/profile?teacher_id=${teacher.id}" class="text-white text-xs font-bold">${teacher.name || 'T'}</a>
        <img src="/icons/math.svg" class=" ml-2 w-5 h-5 filter brightness-0 invert" />
      </div>
    `;
    return el;
  };

  const parseLocation = (location) => {
    if (!location) return null;
    
    // if location is a string
    if (typeof location === 'string') {
      const [lng, lat] = location.split(',').map(coord => parseFloat(coord.trim()));
      return [lng, lat];
    }
    
    // if location is JSON
    if (typeof location === 'object') {
      // log to see the structure
      console.log('Location object:', location);
      // assuming the structure might be {lat, lng} or similar
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
      
      config.apiKey = 'Y1BdlcQrDBZP8dSBx1Wn';
      
      const initialState = { lng: -77.0428, lat: -12.0464, zoom: 12 };

      map = new Map({
        container: mapContainer,
        style: MapStyle.STREETS,
        center: [initialState.lng, initialState.lat],
        zoom: initialState.zoom
      });

      // add markers for each teacher

      console.log(data.teachers);
      
      data.teachers.forEach(teacher => {
        console.log('Processing teacher:', teacher.name, 'Location:', teacher.location);
        
        if (teacher.location) {
          const coordinates = parseLocation(teacher.location);
          
          if (coordinates) {
            console.log('Parsed coordinates:', coordinates);
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

<div class="relative w-full h-[100vh]">
  <div class="absolute w-full h-full" bind:this={mapContainer}></div>
</div>