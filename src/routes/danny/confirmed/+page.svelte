<script lang="ts">
	import { page } from '$app/stores';
	import Hero from '../components/Hero.svelte';
	
	let sessionId = $derived($page.url.searchParams.get('session_id'));
</script>

<svelte:head>
	<title>Bokning bekräftad – Danny</title>
</svelte:head>

<div class="min-h-screen bg-white">
	<Hero title="Tack för din bokning!" />

	<section class="max-w-3xl mx-auto px-6 py-16">
		<div class="bg-white border-4 border-black p-8 md:p-12">
			<!-- Success Icon -->
			<div class="text-center mb-8">
				<div class="inline-block bg-yellow-400 text-black rounded-full p-6 mb-4">
					<svg
						class="w-16 h-16"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="3"
							d="M5 13l4 4L19 7"></path>
					</svg>
				</div>
				<h2 class="text-3xl md:text-4xl font-bold mb-4">Betalning genomförd!</h2>
				<p class="text-lg text-gray-600">Din bokning har tagits emot</p>
			</div>

			<!-- Confirmation Details -->
			<div class="space-y-4 mb-8">
				<div class="border-l-4 border-yellow-400 pl-4">
					<h3 class="font-bold mb-2">Vad händer nu?</h3>
					<ul class="space-y-2 text-gray-700">
						<li class="flex items-start gap-2">
							<span class="text-yellow-400 font-bold mt-1">1.</span>
							<span>Du får ett bekräftelsemail från Stripe med ditt kvitto</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-yellow-400 font-bold mt-1">2.</span>
							<span>Danny kontaktar dig inom 24 timmar för att boka in dina träningspass</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-yellow-400 font-bold mt-1">3.</span>
							<span>Ni bestämmer tillsammans vilka tider som passar bäst</span>
						</li>
					</ul>
				</div>

				{#if sessionId}
					<div class="text-xs text-gray-500 mt-4">
						<p>Referensnummer: <code class="bg-gray-100 px-2 py-1 rounded">{sessionId}</code></p>
					</div>
				{/if}
			</div>

			<!-- Contact Info -->
			<div class="bg-gray-50 p-6 rounded-lg mb-6">
				<h3 class="font-bold mb-3">Kontaktinformation</h3>
				<div class="space-y-2 text-sm">
					<div class="flex items-center gap-2">
						<span class="text-yellow-400">📧</span>
						<a href="mailto:danny@cranmer.se" class="hover:underline">danny@cranmer.se</a>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-yellow-400">📞</span>
						<a href="tel:+46736695092" class="hover:underline">073-669 50 92</a>
					</div>
				</div>
			</div>

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row gap-4">
			<a
				href="/"
				class="flex-1 text-center bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors rounded-lg">
				← Tillbaka till startsidan
			</a>
				<a
					href="/danny/paket"
					class="flex-1 text-center bg-white border-2 border-black text-black px-6 py-3 font-semibold hover:bg-gray-50 transition-colors rounded-lg">
					Se alla paket
				</a>
			</div>
		</div>
	</section>
</div>
