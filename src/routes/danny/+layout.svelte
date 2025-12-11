<script lang="ts">
	import { page } from '$app/stores';
	
	let { children } = $props();
	
	let showFooter = $derived($page.url.pathname !== '/danny' && $page.url.pathname !== '/');
</script>

{@render children()}

{#if showFooter}
	<!-- Footer CTA -->
	<section class="bg-black text-white py-16 px-6">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-3xl md:text-4xl font-bold mb-6">Redo att börja din resa?</h2>
			<p class="text-lg text-gray-300 mb-8">
				Kontakta mig idag för en kostnadsfri konsultation
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
				<a
					href="mailto:danny@cranmer.se"
					class="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 font-bold text-lg hover:bg-yellow-300 transition-colors duration-200 rounded-full">
					<span>📧</span>
					<span>Mejla mig</span>
				</a>
				<a
					href="tel:+46736695092"
					class="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 font-bold text-lg hover:bg-yellow-300 transition-colors duration-200 rounded-full">
					<span>📞</span>
					<span>073-669 50 92</span>
				</a>
			</div>
		</div>
	</section>
{/if}

