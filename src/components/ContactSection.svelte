<script lang="ts">
	export let artistName: string = 'Maria Ocampo';
	export let welcomeText: string = 'Welcome to Atelje';
	export let address: string = 'Rolfsgatan 16';
	export let location: string = 'Sofielunds Folketshus';
	export let mapCoordinates: { lat: number; lng: number } = { lat: 55.6050, lng: 13.0100 };
	export let googleMapsQuery: string = 'Rolfsgatan+16,+Malmö,+Sweden';
	
	// Generate OpenStreetMap embed URL with coordinates
	$: mapBounds = {
		south: mapCoordinates.lat - 0.005,
		west: mapCoordinates.lng - 0.010,
		north: mapCoordinates.lat + 0.005,
		east: mapCoordinates.lng + 0.010
	};
	
	$: osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.west},${mapBounds.south},${mapBounds.east},${mapBounds.north}&layer=mapnik&marker=${mapCoordinates.lat},${mapCoordinates.lng}`;
	$: googleMapsUrl = `https://www.google.com/maps/search/${googleMapsQuery}`;
</script>

<!-- Contact Section -->
<section class="w-full min-h-screen flex items-center justify-center bg-white">
	<div class="w-full max-w-7xl mx-auto flex flex-col lg:flex-row">
		<!-- Contact Info - Left Side (50%) -->
		<div class="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
		<div class="space-y-6">
			<h2 class="text-4xl lg:text-6xl font-thin text-gray-900 mb-8 tracking-[2px]">
				{artistName}
			</h2>
			
			<div class="space-y-4">
				<p class="text-xl lg:text-2xl text-gray-700 font-thin">
					{welcomeText}
				</p>
				
				<div class="space-y-2">
					<p class="text-lg lg:text-xl text-gray-600 font-thin">
						<span class="font-medium">Address:</span>
					</p>
					<p class="text-lg lg:text-xl text-gray-800 font-thin">
						{address}<br>
						{location}
					</p>
				</div>

					<!-- Optional slot for additional contact information -->
					<slot name="additional-info" />
				</div>
			</div>
		</div>

		<!-- Map - Right Side (50%) -->
		<div class="w-full lg:w-1/2 h-96 lg:h-[50vh] relative">
			<iframe
				src={osmEmbedUrl}
				class="w-full h-full border-0"
				style="filter: grayscale(100%);"
				loading="lazy"
				title="Map showing {address}, {location}">
			</iframe>
			
			<!-- Fallback: Static map link -->
			<div class="absolute bottom-4 right-4">
				<a 
					href={googleMapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="bg-black/70 text-white px-3 py-2 rounded text-sm hover:bg-black/90 transition-colors">
					View on Google Maps
				</a>
			</div>

			<!-- Optional slot for additional map overlays -->
			<slot name="map-overlay" />
		</div>
	</div>
</section>
