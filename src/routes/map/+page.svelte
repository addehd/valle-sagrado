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

  // define border colors
  const borderColors = ['border-orange-500', 'border-purple-500', 'border-green-500', 'border-red-500', 'border-blue-500', 'border-yellow-500', 'border-pink-500', 'border-gray-500', 'border-teal-500', 'border-lime-500', 'border-fuchsia-500', 'border-indigo-500', 'border-cyan-500', 'border-emerald-500', 'border-violet-500', 'border-amber-500', 'border-fuchsia-500', 'border-indigo-500', 'border-cyan-500', 'border-emerald-500', 'border-violet-500', 'border-amber-500'];

  const createCustomMarker = (teacher) => {
    const el = document.createElement('div');
    // randomly select a border color
    const randomBorderColor = borderColors[Math.floor(Math.random() * borderColors.length)];
    // update innerhtml to use the random border color
    el.innerHTML = `
      <div style="background-color: #695B46;" class="bg-[#695B46] border ${randomBorderColor} border-[0.5px] p-2 px-4 flex flex-row items-center justify-center rounded-full shadow-lg">
        <a href="/${teacher.url}" class="text-white text-xs font-bold">${teacher.name || 'T'}</a>
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
      
      const initialState = { lng: -71.9675, lat: -13.5319, zoom: 11 };

      map = new Map({
        container: mapContainer,
        style: MapStyle.SATELLITE,
        center: [initialState.lng, initialState.lat],
        zoom: initialState.zoom,
        pitch: 60
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