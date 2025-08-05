<script lang="ts">
	import { onMount } from 'svelte';
	import translationsData from './translations.json';
	import QuoteModal from '../../components/QuoteModal.svelte';
	
	interface Service {
		id: number;
		popular: boolean;
		selected: boolean;
	}
	
	type Language = 'en' | 'sv';
	
	let currentLanguage: Language = 'sv';
	let translations = translationsData[currentLanguage];
	let showQuoteModal = false;
	
	let services: Service[] = [
		{
			id: 1,
			popular: false,
			selected: false
		},
		{
			id: 2,
			popular: true,
			selected: false
		},
		{
			id: 3,
			popular: false,
			selected: false
		},
		{
			id: 4,
			popular: true, 
			selected: true
		}
	];
	
	$: selectedCount = services.filter(service => service.selected).length;
	$: translations = translationsData[currentLanguage];
	$: selectedServices = services.filter(service => service.selected);
	
	function toggleLanguage() {
		currentLanguage = currentLanguage === 'en' ? 'sv' : 'en';
	}
	
	function toggleService(id: number) {
		services = services.map(service => 
			service.id === id ? { ...service, selected: !service.selected } : service
		);
	}
	
	function requestQuote() {
		if (selectedCount > 0) {
			showQuoteModal = true;
		}
	}
	
	function handleModalClose() {
		showQuoteModal = false;
	}
	
	function handleQuoteSuccess(event: CustomEvent) {
		console.log('Quote request successful:', event.detail);
		// You can add success notification logic here
	}
	
	function viewAllServices() {
		console.log('Viewing all services');
	}
</script>

<svelte:head>
	<title>{translations.title} - {currentLanguage === 'sv' ? 'Anpassade Frisbees & Mer' : 'Custom Frisbees & More'}</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-[5]">
		<!-- Language Toggle -->
		<div class="flex justify-end mb-4">
			<button 
				on:click={toggleLanguage}
				class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200">
				<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
				</svg>
				<span class="text-sm font-medium text-gray-700">
					{currentLanguage === 'sv' ? 'English' : 'Svenska'}
				</span>
			</button>
		</div>
		
		<!-- Breadcrumb -->
		<nav class="mb-8">
			<div class="flex items-center text-sm text-gray-600">
				<span class="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
				<span>{translations.breadcrumb}</span>
			</div>
		</nav>
		
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-light text-gray-900 mb-6">{translations.title}</h1>
			<p class="text-lg text-gray-600 mb-6 max-w-3xl">
				{translations.subtitle}
			</p>
			
			<div class="flex flex-wrap gap-4">
				<button 
					on:click={viewAllServices}
					class="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
				>
					{translations.viewAllServices}
				</button>
				
				<button 
					on:click={requestQuote}
					class="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50 transition-colors flex items-center gap-2"
				>
					<span>{translations.getQuoteAllServices}</span>
					<div class="bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
						4
					</div>
				</button>
			</div>
		</div>
		
		<!-- Services Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
			{#each services as service, i}
				<div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative">
					{#if service.popular}
						<div class="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
							{translations.popular}
						</div>
					{/if}
					
					<div class="flex justify-between items-start mb-4">
						<div class="flex-1 pr-4">
							<h3 class="text-lg font-medium text-gray-900 mb-2">
								{translations.services[i].title}
							</h3>
							<p class="text-sm text-gray-600 mb-3">
								{translations.services[i].description}
							</p>
							<div class="text-lg font-semibold text-orange-600">
								{translations.services[i].price}
							</div>
						</div>
						
						<div class="flex items-center gap-3">
							<!-- Checkmark button -->
							<button 
								on:click={() => toggleService(service.id)}
								class="w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center
									{service.selected 
										? 'bg-orange-500 border-orange-500 text-white' 
										: 'border-gray-300 hover:border-gray-400'
									}"
								aria-label="Select {translations.services[i].title}"
							>
								{#if service.selected}
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{/if}
							</button>
							
							<!-- Quote button -->
							<button 
								aria-label="Get quote for {translations.services[i].title}"
								class="w-8 h-8 text-gray-400 hover:text-orange-500 transition-colors"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Request Quote for Selected Button -->
		{#if selectedCount > 0}
			<div class="flex justify-start">
				<button 
					on:click={requestQuote}
					class="bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
				>
					<span>{translations.requestQuoteSelected} ({selectedCount})</span>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</button>
			</div>
		{/if}
		
		<!-- Contact Information -->
		<div class="mt-16 bg-white rounded-lg p-8 border border-gray-200">
			<div class="grid md:grid-cols-2 gap-8">
				<div>
					<h2 class="text-2xl font-semibold text-gray-900 mb-4">{translations.whyChooseUs}</h2>
					<ul class="space-y-3 text-gray-600">
						{#each translations.benefits as benefit}
							<li class="flex items-center gap-3">
								<span class="w-2 h-2 bg-orange-500 rounded-full"></span>
								<span>{benefit}</span>
							</li>
						{/each}
					</ul>
				</div>
				
				<div>
					<h2 class="text-2xl font-semibold text-gray-900 mb-4">{translations.getInTouch}</h2>
					<div class="space-y-4 text-gray-600">
						<div class="flex items-center gap-3">
							<svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
							<span>hello@printservices.com</span>
						</div>
						<div class="flex items-center gap-3">
							<svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
							</svg>
							<span>+1 (555) 123-4567</span>
						</div>
						<div class="flex items-center gap-3">
							<svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>{translations.businessHours}</span>
						</div>
						<div class="mt-6">
							<button class="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors">
								{translations.contactUsToday}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Decorative element (stylized sun rays) -->
		<div class="fixed left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 opacity-5 pointer-events-none z-[1]">
			<div class="relative">
				{#each Array(50) as _, i}
					<div 
						class="absolute bg-gray-300 origin-right"
						style="
							width: 300px; 
							height: 1px; 
							transform: rotate({i * 3.6}deg);
							transform-origin: right center;
						"
					></div>
				{/each}
				<div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-20 h-20 bg-gray-100 rounded-full opacity-50"></div>
			</div>
		</div>
	</div>
</div>

<!-- Quote Modal -->
<QuoteModal 
	isOpen={showQuoteModal}
	{selectedServices}
	{translations}
	on:close={handleModalClose}
	on:success={handleQuoteSuccess}
/>