<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
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

	let activeSection: 'gym' | 'home' | 'subscription' = 'gym';
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
					on:click={() => (activeSection = 'gym')}
					class="flex-1 py-4 px-6 font-bold transition-all duration-200 border-b-4"
					class:border-yellow-400={activeSection === 'gym'}
					class:text-black={activeSection === 'gym'}
					class:border-transparent={activeSection !== 'gym'}
					class:text-gray-400={activeSection !== 'gym'}>
					Gym
				</button>
				<button
					on:click={() => (activeSection = 'home')}
					class="flex-1 py-4 px-6 font-bold transition-all duration-200 border-b-4"
					class:border-yellow-400={activeSection === 'home'}
					class:text-black={activeSection === 'home'}
					class:border-transparent={activeSection !== 'home'}
					class:text-gray-400={activeSection !== 'home'}>
					Hemträning
				</button>
				<button
					on:click={() => (activeSection = 'subscription')}
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

	<!-- Footer CTA -->
	<section class="bg-black text-white py-16 px-6">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-3xl md:text-4xl font-bold mb-6">Redo att börja din resa?</h2>
			<p class="text-lg text-gray-300 mb-8">
				Kontakta mig idag för en kostnadsfri konsultation
			</p>
			<a
				href="mailto:danny@cranmer.se"
				class="inline-block bg-yellow-400 text-black px-10 py-4 font-bold text-lg hover:bg-yellow-300 transition-colors duration-200 rounded-full">
				Boka nu
			</a>
		</div>
	</section>
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
