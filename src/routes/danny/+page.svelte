<script lang="ts">
	import CranmerLogo from './components/CranmerLogo.svelte';
	import MetaTags from '$components/MetaTags.svelte';
</script>

<MetaTags 
	title="Cranmer - Executive Coaching"
	description="Professional executive coaching and leadership development with Danny Cranmer."
	siteName="Cranmer" />

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
		<a href="/pt-i-malmo" class="text-6xl md:text-7xl lg:text-8xl font-bold text-white hover:text-[#fcea0d] transition-colors duration-300 font-sans">
			About me
		</a>
		<a href="/coaching" class="text-6xl md:text-7xl lg:text-8xl font-bold text-white hover:text-[#fcea0d] transition-colors duration-300 font-sans">
			Coaching
		</a>
		<a href="/paket" class="text-6xl md:text-7xl lg:text-8xl font-bold text-white hover:text-[#fcea0d] transition-colors duration-300 font-sans">
			Book
		</a>
	</nav>
	</div>
</div>