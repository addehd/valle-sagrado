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
  // define background colors
  const bgColors = ['bg-orange-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-pink-500', 'bg-gray-500', 'bg-teal-500', 'bg-lime-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500'];

  const createCustomMarker = (teacher) => {
    const el = document.createElement('div');
    // randomly select a background color
    const randomBgColor = bgColors[Math.floor(Math.random() * bgColors.length)];
    // update innerhtml to use the random background color
    el.innerHTML = `
      <div class="${randomBgColor} border-white border-[0.5px] p-2 px-4 flex flex-row items-center justify-center rounded-full shadow-lg">
        <a href="/${teacher.url}" class="text-white text-xs font-bold">${teacher.name || 'T'}</a>
        <img src="/images/astro-icon.svg" class="ml-2 w-6I just want to add.  h-6 filter brightness-0 invert" />
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
      // assuming the structure might be {lat, lng} or similar
      return location.coordinates || [location.longitude, location.latitude] || null;
    }
    
    return null;
  };

  // Parse locations for all teachers
  let teachersWithCoordinates: TeacherWithCoordinates[] = [];
  
  $: {
    if (data.teachers?.length > 0) {
      teachersWithCoordinates = data.teachers.map((teacher) => {
        const coordinates = parseLocation(teacher.location);
        return {
          ...teacher,
          coordinates
        };
      });
    }
  }

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
      
      if (data.teachers && data.teachers.length > 0) {
        data.teachers.forEach((teacher, index) => {
          
          // Parse the teacher's location
          const coordinates = parseLocation(teacher.location);
          
          if (coordinates) {
            // Create marker for teacher
            createMarker(coordinates, teacher, map);
          }
        });
      }
    }
  });

  onDestroy(() => {
    if (map) map.remove();
  });
</script>

<div class="relative w-full h-[100vh] bg-amber-300">
  <div class="absolute w-full h-full" bind:this={mapContainer}></div>
</div>