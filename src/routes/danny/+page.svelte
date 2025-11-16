<script lang="ts">
	import CranmerLogo from './components/CranmerLogo.svelte';
</script>

<style>
	.hero-bg {
		background-image: url('/images/danny.webp');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
</style>

<div class="fixed inset-0 hero-bg">
	<div class="h-full flex flex-col justify-center items-end pr-16 md:pr-24 lg:pr-32">
		<!-- Logo -->
		<div class="mb-16">
			<CranmerLogo width="200" height="142" />
		</div>

		<!-- Navigation Links -->
		<nav class="flex flex-col gap-8 text-right">
			<a
				href="/danny/om-mig"
				class="text-6xl md:text-7xl lg:text-8xl font-bold text-white hover:text-yellow-300 transition-colors duration-300 font-sans">
				Om mig
			</a>
			<a
				href="/danny/coaching"
				class="text-6xl md:text-7xl lg:text-8xl font-bold text-white hover:text-yellow-300 transition-colors duration-300 font-sans">
				Coaching
			</a>
			<a
				href="/danny/paket"
				class="text-6xl md:text-7xl lg:text-8xl font-bold text-white hover:text-yellow-300 transition-colors duration-300 font-sans">
				Boka
			</a>
		</nav>
	</div>
</div>
