<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import Hero from '../components/Hero.svelte';

	type Package = {
		id: string;
		title: string;
		subtitle: string;
		emoji: string;
		purpose: string;
		content: string[];
		price: string;
		pricePerHour: string;
		installment?: boolean;
		badge?: string;
	};

	type Subscription = {
		id: string;
		title: string;
		subtitle: string;
		emoji: string;
		schedule: string;
		pricePerSession: string;
		pricePerMonth: string;
		badge?: string;
	};

	// Modal state
	let showPaymentModal = $state(false);
	let selectedPackage = $state<Package | Subscription | null>(null);
	let isSubmitting = $state(false);

	function openPaymentModal(pkg: Package | Subscription) {
		selectedPackage = pkg;
		showPaymentModal = true;
	}

	function closePaymentModal() {
		showPaymentModal = false;
		selectedPackage = null;
		isSubmitting = false;
	}

	// Determine if package is a subscription
	function isSubscriptionPackage(pkg: Package | Subscription): boolean {
		return 'pricePerMonth' in pkg;
	}

	// Get package price
	function getPackagePrice(pkg: Package | Subscription): string {
		return 'price' in pkg ? pkg.price : pkg.pricePerMonth;
	}

	const gymPackages: Package[] = [
		{
			id: 'gym-01',
			title: 'Paket 01',
			subtitle: 'Introduktion & Hälsokonsultation',
			emoji: '',
			purpose: 'För dig som vill börja på rätt sätt med struktur, fokus och motivation.',
			content: [
				'60 min session i gymmet',
				'30 min konsultation',
				'Rörelseanalys, målsättning och individuell träningsplan',
				'Genomgång av styrka, teknik och andning'
			],
			price: '1 500 kr',
			pricePerHour: '1 000 kr'
		},
		{
			id: 'gym-02',
			title: 'Paket 02',
			subtitle: 'Balans & Energi',
			emoji: '',
			purpose: 'Kom igång och bygg upp en stabil grund av styrka och balans.',
			content: [
				'10 individuella träningspass på gymmet (60 min/pass)',
				'Helkroppsprogram + teknikträning',
				'Personligt stöd via mejl/sms'
			],
			price: '8 000 kr',
			pricePerHour: '800 kr',
			installment: true
		},
		{
			id: 'gym-03',
			title: 'Paket 03',
			subtitle: 'Helhetsförvandling',
			emoji: '',
			purpose: 'Skapa hållbara resultat och utveckla både kropp och sinne.',
			content: [
				'25 träningspass (60 min/pass)',
				'Kombination av styrka, rörlighet, boxning och mindfulness',
				'Anpassad träningsplan + kontinuerlig uppföljning'
			],
			price: '18 750 kr',
			pricePerHour: '750 kr',
			installment: true
		},
		{
			id: 'gym-04',
			title: 'Paket 04',
			subtitle: 'Lifestyle Coaching',
			emoji: '',
			purpose: 'För dig som vill ha helhetsutveckling med långsiktigt fokus.',
			content: [
				'50 träningspass (60 min/pass)',
				'Fysprofil, kostrådgivning och återhämtningsstrategi',
				'Prioriterad tillgång och personlig livsstilscoaching'
			],
			price: '35 000 kr',
			pricePerHour: '700 kr',
			installment: true,
			badge: 'VIP'
		}
	];

	const homePackages: Package[] = [
		{
			id: 'home-01',
			title: 'Paket 01',
			subtitle: 'Introduktion & Hälsokonsultation',
			emoji: '',
			purpose: 'Skapa en helhetsbild av mål, livsstil och behov.',
			content: [
				'90 min hembesök med analys av hälsa och mål',
				'Rörelseanalys, stress- och sömnkartläggning',
				'Skräddarsydd plan för träning och återhämtning'
			],
			price: '2 250 kr',
			pricePerHour: '1 500 kr'
		},
		{
			id: 'home-02',
			title: 'Paket 02',
			subtitle: 'Balans & Energi',
			emoji: '',
			purpose: 'Kom igång med en personlig helhetsrutin hemma.',
			content: [
				'2 träningspass/vecka (60 min) hemma hos dig',
				'Mix av styrka, yoga, boxning och mindfulness',
				'Rådgivning och uppföljning via mejl/sms'
			],
			price: '12 500 kr',
			pricePerHour: '1 250 kr',
			installment: true
		},
		{
			id: 'home-03',
			title: 'Paket 03',
			subtitle: 'Helhetsförvandling',
			emoji: '',
			purpose: 'Fördjupa din utveckling med fokus på kropp, sinne och vanor.',
			content: [
				'2 hembesök/vecka',
				'Individuell plan för träning, kost och återhämtning',
				'Veckovis avstämning och digitalt träningsmaterial'
			],
			price: '27 500 kr',
			pricePerHour: '1 100 kr',
			installment: true
		},
		{
			id: 'home-04',
			title: 'Paket 04',
			subtitle: 'Lifestyle Coaching',
			emoji: '',
			purpose: 'Långsiktigt samarbete som personlig hälsopartner.',
			content: [
				'2–3 hembesök/vecka året runt',
				'Hälsomätningar, meditationscoaching och stresshantering',
				'Möjlighet till "mini-retreats" hemma (2–3 h)'
			],
			price: '45 000 kr',
			pricePerHour: '900 kr',
			installment: true,
			badge: 'VIP'
		}
	];

	const subscriptions: Subscription[] = [
		{
			id: 'sub-01',
			title: 'Paket 01 – BALANS',
			subtitle: '1x / vecka',
			emoji: '',
			schedule: 'För dig som vill ha kontinuitet och regelbunden motivation.',
			pricePerSession: '700 kr',
			pricePerMonth: '3 010 kr'
		},
		{
			id: 'sub-02',
			title: 'Paket 02 – FOKUS',
			subtitle: '2x / vecka',
			emoji: '',
			schedule: 'För dig som vill skapa tydliga resultat och känna framsteg varje vecka.',
			pricePerSession: '675 kr',
			pricePerMonth: '5 805 kr'
		},
		{
			id: 'sub-03',
			title: 'Paket 03 – TRANSFORMATION',
			subtitle: '3x / vecka',
			emoji: '',
			schedule: 'För dig som vill gå all in och skapa en hållbar livsstilsförändring.',
			pricePerSession: '650 kr',
			pricePerMonth: '8 385 kr',
			badge: 'BÄST'
		}
	];

	let activeSection = $state<'gym' | 'home' | 'subscription'>('gym');
</script>

<svelte:head>
	<title>Danny – Personlig Träning</title>
	<meta name="description" content="Personlig träning med Danny – Gym, hemträning och livsstilscoaching" />
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- Hero Section -->
	<Hero 
		subtitle="Personlig Träning & Livsstilscoaching"
		badgeText="Move Your Body, Still Your Mind" />

	<!-- Navigation Tabs -->
	<section class="sticky top-0 z-50 bg-white border-b-2 border-black">
		<div class="max-w-6xl mx-auto px-6">
			<div class="flex gap-0 -mb-[2px]">
				<button
					onclick={() => (activeSection = 'gym')}
					class="flex-1 py-4 px-6 font-bold transition-all duration-200 border-b-4"
					class:border-yellow-400={activeSection === 'gym'}
					class:text-black={activeSection === 'gym'}
					class:border-transparent={activeSection !== 'gym'}
					class:text-gray-400={activeSection !== 'gym'}>
					Gym
				</button>
				<button
					onclick={() => (activeSection = 'home')}
					class="flex-1 py-4 px-6 font-bold transition-all duration-200 border-b-4"
					class:border-yellow-400={activeSection === 'home'}
					class:text-black={activeSection === 'home'}
					class:border-transparent={activeSection !== 'home'}
					class:text-gray-400={activeSection !== 'home'}>
					Hemträning
				</button>
				<button
					onclick={() => (activeSection = 'subscription')}
					class="flex-1 py-4 px-6 font-bold transition-all duration-200 border-b-4"
					class:border-yellow-400={activeSection === 'subscription'}
					class:text-black={activeSection === 'subscription'}
					class:border-transparent={activeSection !== 'subscription'}
					class:text-gray-400={activeSection !== 'subscription'}>
					Abonnemang
				</button>
			</div>
		</div>
	</section>

	<!-- Gym Packages -->
	{#if activeSection === 'gym'}
		<section class="py-16 px-6" transition:fade={{ duration: 300 }}>
			<div class="max-w-6xl mx-auto">
				<h2 class="text-4xl font-bold text-center mb-4">
					Personlig Träning – Gym
				</h2>
				<p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
					Träna smart, säkert och effektivt med personlig vägledning i gymmet
				</p>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					{#each gymPackages as pkg, i}
						<div
							in:fly={{ y: 50, duration: 400, delay: i * 100, easing: quintOut }}
							class="relative bg-white border-4 border-black p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
							<!-- Payment Button -->
							<button
								onclick={() => openPaymentModal(pkg)}
								class="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-semibold px-3 py-1.5 rounded-full transition-colors duration-200">
								Betala online
							</button>
							
							{#if pkg.badge}
								<div
									class="absolute -top-4 -left-4 bg-yellow-400 text-black font-bold px-6 py-2 rotate-3 shadow-lg">
									{pkg.badge}
								</div>
							{/if}
							<h3 class="text-2xl font-bold mb-2">{pkg.title}</h3>
							<p class="text-lg font-semibold text-gray-700 mb-4">{pkg.subtitle}</p>
							<p class="text-sm italic text-gray-600 mb-6 border-l-4 border-yellow-400 pl-4">
								{pkg.purpose}
							</p>
							<ul class="space-y-2 mb-6">
								{#each pkg.content as item}
									<li class="flex items-start gap-2">
										<span class="text-yellow-400 font-bold mt-1">✓</span>
										<span class="text-sm">{item}</span>
									</li>
								{/each}
							</ul>
							<div class="border-t-2 border-gray-200 pt-6">
								<div class="flex justify-between items-center mb-2">
									<span class="text-sm font-semibold text-gray-600">Totalpris:</span>
									<span class="text-3xl font-bold">{pkg.price}</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-xs text-gray-500">Per timme:</span>
									<span class="text-lg font-semibold text-gray-700">{pkg.pricePerHour}</span>
								</div>
								{#if pkg.installment}
									<div class="mt-4 bg-yellow-400 text-black text-center py-2 font-semibold text-sm">
										Delbetalning finns
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Home Training Packages -->
	{#if activeSection === 'home'}
		<section class="py-16 px-6" transition:fade={{ duration: 300 }}>
			<div class="max-w-6xl mx-auto">
				<h2 class="text-4xl font-bold text-center mb-4">
					Personlig Träning i Hemmet
				</h2>
				<p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
					Yoga, boxning, styrka & mindfulness – direkt i ditt hem
				</p>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					{#each homePackages as pkg, i}
						<div
							in:fly={{ y: 50, duration: 400, delay: i * 100, easing: quintOut }}
							class="relative bg-white border-4 border-black p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
							<!-- Payment Button -->
							<button
								onclick={() => openPaymentModal(pkg)}
								class="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-semibold px-3 py-1.5 rounded-full transition-colors duration-200">
								Betala online
							</button>
							
							{#if pkg.badge}
								<div
									class="absolute -top-4 -right-4 bg-yellow-400 text-black font-bold px-6 py-2 rotate-3 shadow-lg">
									{pkg.badge}
								</div>
							{/if}
							<h3 class="text-2xl font-bold mb-2">{pkg.title}</h3>
							<p class="text-lg font-semibold text-gray-700 mb-4">{pkg.subtitle}</p>
							<p class="text-sm italic text-gray-600 mb-6 border-l-4 border-yellow-400 pl-4">
								{pkg.purpose}
							</p>
							<ul class="space-y-2 mb-6">
								{#each pkg.content as item}
									<li class="flex items-start gap-2">
										<span class="text-yellow-400 font-bold mt-1">✓</span>
										<span class="text-sm">{item}</span>
									</li>
								{/each}
							</ul>
							<div class="border-t-2 border-gray-200 pt-6">
								<div class="flex justify-between items-center mb-2">
									<span class="text-sm font-semibold text-gray-600">Totalpris:</span>
									<span class="text-3xl font-bold">{pkg.price}</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-xs text-gray-500">Per timme:</span>
									<span class="text-lg font-semibold text-gray-700">{pkg.pricePerHour}</span>
								</div>
								{#if pkg.installment}
									<div class="mt-4 bg-yellow-400 text-black text-center py-2 font-semibold text-sm">
										Delbetalning finns
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Subscription Packages -->
	{#if activeSection === 'subscription'}
		<section class="py-16 px-6" transition:fade={{ duration: 300 }}>
			<div class="max-w-6xl mx-auto">
				<h2 class="text-4xl font-bold text-center mb-4">
					Abonnemangspaket – "Move Your Body, Still Your Mind"
				</h2>
				<p class="text-center text-gray-600 mb-4 max-w-2xl mx-auto">
					Löpande PT-upplägg – 12 månader
				</p>
				<p class="text-center text-sm text-gray-500 mb-12">
					Med pausmöjlighet vid sjukdom/semester
				</p>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
					{#each subscriptions as sub, i}
						<div
							in:fly={{ y: 50, duration: 400, delay: i * 100, easing: quintOut }}
							class="relative bg-white border-4 border-black p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
							class:ring-4={sub.badge}
							class:ring-yellow-400={sub.badge}>
							<!-- Payment Button -->
							<button
								onclick={() => openPaymentModal(sub)}
								class="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-semibold px-3 py-1.5 rounded-full transition-colors duration-200">
								Betala online
							</button>
							
							{#if sub.badge}
								<div
									class="absolute -top-4 -right-4 bg-yellow-400 text-black font-bold px-6 py-2 rotate-3 shadow-lg">
									{sub.badge}
								</div>
							{/if}
							<h3 class="text-2xl font-bold mb-2 text-center">{sub.title}</h3>
							<p class="text-lg font-semibold text-center text-gray-700 mb-6">{sub.subtitle}</p>
							<p class="text-sm text-gray-600 mb-8 border-l-4 border-yellow-400 pl-4">
								{sub.schedule}
							</p>
							<div class="space-y-4">
								<div class="bg-black text-white p-4 text-center">
									<div class="text-sm mb-1">Pris per pass</div>
									<div class="text-2xl font-bold">{sub.pricePerSession}</div>
								</div>
								<div class="bg-yellow-400 text-black p-4 text-center">
									<div class="text-sm font-semibold mb-1">Månadskostnad</div>
									<div class="text-3xl font-bold">{sub.pricePerMonth}</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Payment Modal -->
	{#if showPaymentModal && selectedPackage}
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
			onclick={(e) => e.target === e.currentTarget && closePaymentModal()}
			onkeydown={(e) => e.key === 'Escape' && closePaymentModal()}>
			<div class="bg-white rounded-lg max-w-md w-full p-8 relative">
				<!-- Close Button -->
				<button
					onclick={closePaymentModal}
					class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">
					×
				</button>

				<!-- Package Info -->
				<div class="mb-6">
					<h3 id="modal-title" class="text-2xl font-bold mb-2">{selectedPackage.title}</h3>
					<p class="text-gray-600 mb-4">{selectedPackage.subtitle}</p>
					<div class="bg-yellow-400 text-black p-4 rounded-lg text-center">
						<div class="text-sm font-semibold">
							{isSubscriptionPackage(selectedPackage) ? 'Pris per månad' : 'Totalpris'}
						</div>
						<div class="text-3xl font-bold">
							{getPackagePrice(selectedPackage)}
						</div>
						{#if isSubscriptionPackage(selectedPackage)}
							<div class="text-xs mt-1 opacity-75">Återkommande betalning</div>
						{/if}
					</div>
				</div>

				<!-- Customer Information Form -->
				<form method="POST" action="?/createCheckout" use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}} class="space-y-4">
					<!-- Hidden fields for package data -->
					<input type="hidden" name="package_id" value={selectedPackage.id} />
					<input type="hidden" name="package_title" value={selectedPackage.title} />
					<input type="hidden" name="package_price" value={getPackagePrice(selectedPackage)} />
					<input type="hidden" name="is_subscription" value={isSubscriptionPackage(selectedPackage)} />

					<div>
						<label for="customer-name" class="block text-sm font-medium text-gray-700 mb-1">
							Namn *
						</label>
						<input
							type="text"
							id="customer-name"
							name="customer_name"
							required
							disabled={isSubmitting}
							class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50"
							placeholder="Ditt fullständiga namn" />
					</div>

					<div>
						<label for="customer-email" class="block text-sm font-medium text-gray-700 mb-1">
							E-post *
						</label>
						<input
							type="email"
							id="customer-email"
							name="customer_email"
							required
							disabled={isSubmitting}
							class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50"
							placeholder="din@email.se" />
					</div>

					<div>
						<label for="customer-phone" class="block text-sm font-medium text-gray-700 mb-1">
							Telefon *
						</label>
						<input
							type="tel"
							id="customer-phone"
							name="customer_phone"
							required
							disabled={isSubmitting}
							class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50"
							placeholder="073-123 45 67" />
					</div>

					<div>
						<label for="customer-message" class="block text-sm font-medium text-gray-700 mb-1">
							Meddelande (valfritt)
						</label>
						<textarea
							id="customer-message"
							name="customer_message"
							rows="3"
							disabled={isSubmitting}
							class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50"
							placeholder="T.ex. önskade tider, särskilda behov..."></textarea>
					</div>

					<!-- Payment Button -->
					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
						{isSubmitting ? 'Förbereder betalning...' : 'Fortsätt till betalning →'}
					</button>
				</form>

				<!-- Payment Provider Info -->
				<div class="mt-6 pt-6 border-t border-gray-200">
					<div class="flex items-center justify-center gap-2 mb-3">
						<span class="text-sm text-gray-600">Säker betalning via</span>
						<svg class="h-6" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M59.6 13.4c0-4.1-2-7.4-6-7.4s-6.4 3.3-6.4 7.3c0 4.8 2.7 7.3 6.8 7.3 2 0 3.4-.4 4.6-1.1v-3c-1.2.6-2.4 1-4.2 1-1.7 0-3.2-.6-3.4-2.7h8.5c0-.2.1-.9.1-1.4zm-8.6-1.5c0-2 1.2-2.8 2.5-2.8s2.4.8 2.4 2.8h-4.9zm-10.5-5.3c-1.6 0-2.7.8-3.3 1.3l-.2-1h-4v19.4l4.5-1 .1-4.7c.6.4 1.5 1 3 1 3 0 5.7-2.4 5.7-7.4-.1-4.7-2.8-7.6-5.8-7.6zm-1.1 11.7c-1 0-1.6-.4-2-.8l-.1-6.3c.5-.5 1.1-.9 2-.9 1.6 0 2.6 1.8 2.6 4s-1 4-2.5 4zm-9.4-11.7c-1.6 0-2.7.8-3.3 1.3l-.2-1h-4v19.4l4.5-1 .1-4.7c.6.4 1.5 1 3 1 3 0 5.7-2.4 5.7-7.4-.1-4.7-2.8-7.6-5.8-7.6zm-1.1 11.7c-1 0-1.6-.4-2-.8l-.1-6.3c.5-.5 1.1-.9 2-.9 1.6 0 2.6 1.8 2.6 4s-1 4-2.5 4zm-10.3-8.9c.5 0 .9.1 1.3.2v-4.2c-.4-.1-.9-.2-1.4-.2-1.4 0-2.5.4-3.4 1.6V6.9h-4.5v13.4h4.5v-7.4c0-1.6.8-2.4 2.1-2.4h1.4zm-12.1-3.8l4.5-1v-3.3l-4.5 1v3.3zm0 .9h4.5v13.4h-4.5V6.5zM4.5 3.7L0 4.7v2.8l4.5-.9V3.7zm0 3.8H0v13.4h4.5V7.5z" fill="#635BFF"/>
						</svg>
					</div>
					
					<!-- Payment Method Icons -->
					<div class="flex justify-center items-center gap-3 mb-3">
						<!-- Visa -->
						<svg class="h-8" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="48" height="32" rx="4" fill="white"/>
							<rect width="48" height="32" rx="4" stroke="#E5E7EB" stroke-width="1"/>
							<path d="M19.8 11.2L17.1 20.8H14.5L12.8 13.7C12.7 13.3 12.5 13 12.2 12.8C11.6 12.5 10.7 12.2 9.9 12L10 11.2H14C14.5 11.2 14.9 11.5 15 12L15.9 17.3L18.1 11.2H19.8ZM32 17.2C32 18.8 30.6 19.9 28.5 19.9C27.4 19.9 26.5 19.7 25.7 19.3L26.1 17.8C26.8 18.2 27.6 18.4 28.3 18.4C29 18.4 29.5 18.2 29.5 17.8C29.5 17.4 29 17.2 28.3 16.9C27.2 16.5 26.5 15.8 26.5 14.8C26.5 13.2 27.9 12.1 30 12.1C30.9 12.1 31.7 12.3 32.3 12.5L31.9 14C31.3 13.8 30.7 13.6 30 13.6C29.4 13.6 29 13.8 29 14.1C29 14.5 29.6 14.7 30.3 15C31.5 15.4 32 16.1 32 17.2ZM27 11.2L24.9 20.8H23.3L25.4 11.2H27ZM37.5 11.2L35.7 20.8H34.2L34 19.5C33.6 20 33 20.3 32.2 20.3C30.7 20.3 29.5 19 29.5 17.2C29.5 15.3 30.8 13.6 32.5 13.6C33.2 13.6 33.8 13.9 34.1 14.3L34.3 11.2H37.5ZM33.8 18.5C34.5 18.5 35.1 18 35.2 17.3C35.2 16.5 34.8 16 34.2 16C33.5 16 32.9 16.5 32.9 17.3C32.9 18 33.3 18.5 33.8 18.5Z" fill="#1434CB"/>
						</svg>
						
						<!-- Mastercard -->
						<svg class="h-8" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="48" height="32" rx="4" fill="white"/>
							<rect width="48" height="32" rx="4" stroke="#E5E7EB" stroke-width="1"/>
							<circle cx="18" cy="16" r="7" fill="#EB001B"/>
							<circle cx="30" cy="16" r="7" fill="#F79E1B"/>
							<path d="M24 11.5C22.8 12.4 22 13.8 22 15.5C22 17.2 22.8 18.6 24 19.5C25.2 18.6 26 17.2 26 15.5C26 13.8 25.2 12.4 24 11.5Z" fill="#FF5F00"/>
						</svg>
						
						<!-- Amex -->
						<svg class="h-8" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="48" height="32" rx="4" fill="#006FCF"/>
							<path d="M18.5 19.2L16.8 15.5H14V20H15.5V16.3L17.2 20H18.8L20.5 16.3V20H22V15.5H19.2L18.5 19.2ZM13 15.5H8V16.5H10V20H11.5V16.5H13V15.5ZM31 18V17H28.5V16.5H31V15.5H27V20H31V19H28.5V18H31ZM24.5 20L26 17.8L27.5 20H29.5L27 16.8L29.5 15.5H27.5L26 17.2L24.5 15.5H22.5L25 16.8L22.5 20H24.5ZM35.5 18.5H37L35.2 15.5H33.5L31.7 20H33.2L33.5 19.2H36.8L35.5 18.5ZM34 17L35 18.5H33L34 17Z" fill="white"/>
						</svg>
						
						<!-- Generic Card -->
						<svg class="h-8" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="48" height="32" rx="4" fill="white"/>
							<rect width="48" height="32" rx="4" stroke="#E5E7EB" stroke-width="1"/>
							<rect x="8" y="14" width="12" height="2" rx="1" fill="#9CA3AF"/>
							<rect x="8" y="18" width="8" height="2" rx="1" fill="#9CA3AF"/>
							<circle cx="38" cy="16" r="4" fill="#E5E7EB"/>
							<circle cx="34" cy="16" r="4" fill="#E5E7EB"/>
						</svg>
					</div>
				</div>

				<p class="text-xs text-gray-500 text-center mt-4">
					Danny kontaktar dig inom 24 timmar för att boka tider.
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Custom scrollbar for better look */
	:global(body) {
		scrollbar-width: thin;
		scrollbar-color: #facc15 #000;
	}

	:global(body::-webkit-scrollbar) {
		width: 8px;
	}

	:global(body::-webkit-scrollbar-track) {
		background: #000;
	}

	:global(body::-webkit-scrollbar-thumb) {
		background: #facc15;
		border-radius: 4px;
	}
</style>
