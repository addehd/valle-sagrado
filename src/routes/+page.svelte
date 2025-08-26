<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import '@maptiler/sdk/dist/maptiler-sdk.css'
  
  interface TeacherWithCoordinates {
    [key: string]: any;
    coordinates?: [number, number] | null;
  }
  
  export let data: any;
  
  let map: any;
  let mapContainer: HTMLDivElement;
  let Map: any;
  let MapStyle: any;
  let Marker: any;
  let config: any;
  // define background colors
  const bgColors = ['bg-orange-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-pink-500', 'bg-gray-500', 'bg-teal-500', 'bg-lime-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500'];

  const createCustomMarker = (teacher: any) => {
    const el = document.createElement('div');
    // randomly select a background color
    const randomBgColor = bgColors[Math.floor(Math.random() * bgColors.length)];
    // update innerhtml to use the random background color
    el.innerHTML = `
      <div class="${randomBgColor} border-white border-[0.5px] p-2 px-4 flex flex-row items-center justify-center rounded-full shadow-lg">
        <a href="/${teacher.url}" class="text-white text-xs font-bold">${teacher.name || 'T'}</a>
        <img src="/images/astro-icon.svg" class="ml-2 w-6 h-6 filter brightness-0 invert" />
      </div>
    `;
    return el;
  };

  const parseLocation = (location: any): [number, number] | null => {
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

  const createMarker = (coordinates: [number, number], teacher: any, map: any) => {
    const markerElement = createCustomMarker(teacher);
    new Marker({ element: markerElement })
      .setLngLat(coordinates)
      .addTo(map);
  };

  // Calculate map bounds from all valid coordinates
  const calculateMapBounds = (coordinates: [number, number][]) => {
    if (coordinates.length === 0) {
      // Fallback to Sacred Valley if no coordinates
      return {
        center: [-71.9675, -13.5319],
        zoom: 13
      };
    }

    if (coordinates.length === 1) {
      // Single marker - center on it with reasonable zoom
      return {
        center: coordinates[0],
        zoom: 15
      };
    }

    // Calculate bounding box
    const lngs = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);
    
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Calculate center point
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    // Calculate zoom level based on the span
    const lngSpan = maxLng - minLng;
    const latSpan = maxLat - minLat;
    const maxSpan = Math.max(lngSpan, latSpan);

    // Zoom calculation (adjust these values to fine-tune)
    let zoom = 13; // default
    if (maxSpan > 0.5) zoom = 10;      // very wide area
    else if (maxSpan > 0.2) zoom = 11; // wide area  
    else if (maxSpan > 0.1) zoom = 12; // medium area
    else if (maxSpan > 0.05) zoom = 13; // small area
    else if (maxSpan > 0.02) zoom = 14; // very small area
    else zoom = 15; // tiny area

    return {
      center: [centerLng, centerLat],
      zoom: zoom
    };
  };

  // Parse locations for all teachers
  let teachersWithCoordinates: TeacherWithCoordinates[] = [];
  
  $: {
    if (data.teachers?.length > 0) {
      teachersWithCoordinates = data.teachers.map((teacher: any) => {
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
      
      // Calculate optimal center and zoom based on all valid coordinates
      const allValidCoordinates: [number, number][] = [];
      
      if (data.teachers && data.teachers.length > 0) {
        data.teachers.forEach((teacher: any) => {
          const coordinates = parseLocation(teacher.location);
          if (coordinates) {
            allValidCoordinates.push(coordinates);
          }
        });
      }

      const mapConfig = calculateMapBounds(allValidCoordinates);

      map = new Map({
        container: mapContainer,
        style: MapStyle.SATELLITE,
        center: mapConfig.center,
        zoom: mapConfig.zoom,
        pitch: 60,
        // Disable ALL default controls
        attributionControl: false,
        logoControl: false,
        navigationControl: false,
        scaleControl: false,
        geolocateControl: false,
        fullscreenControl: false
      });

      // Add only the controls we want with custom positioning
      map.addControl(new sdk.NavigationControl(), 'bottom-right');
      map.addControl(new sdk.ScaleControl(), 'bottom-left');

      if (data.teachers && data.teachers.length > 0) {
        data.teachers.forEach((teacher: any, index: number) => {
          
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
  
  <!-- Enhanced Title and Text Box - Top Left Corner -->
  <div class="absolute top-4 left-4 md:top-6 md:left-6 z-20 w-full max-w-xs md:max-w-md mx-4 md:mx-0">
    <div class="backdrop-blur-md bg-white/20 rounded-xl p-4 md:p-6 shadow-lg border border-white/30 transition-all duration-300 ease-in-out hover:bg-white/25 hover:scale-[1.02] cursor-default">
      <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg" role="banner" aria-label="Valle Sagrado main title">
        Valle Sagrado
      </h1>
      <div class="text-white/90 space-y-1 md:space-y-2">
        <p class="flex items-center text-xs md:text-sm lg:text-base font-medium">
          <svg class="w-3 h-3 md:w-4 md:h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Sacred Valley, Peru
        </p>
        <p class="text-xs md:text-sm lg:text-base leading-relaxed overflow-hidden">
          <span class="line-clamp-2 md:line-clamp-3">
            Discover unique local projects, artisans, and experiences from the Sacred Valley. Connect with local communities and explore authentic Peruvian culture.
          </span>
        </p>
        <div class="flex items-center space-x-2 text-xs text-white/75 mt-2 md:mt-3">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="hidden sm:inline">Click markers to explore projects</span>
          <span class="sm:hidden">Tap markers to explore</span>
        </div>
      </div>
      <!-- Subtle gradient accent -->
      <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
    </div>
  </div>
</div>

<style>
  /* Line clamp utility for text truncation - fallback for older Tailwind versions */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>