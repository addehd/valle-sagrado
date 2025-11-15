<script>
	let { quote, name, title } = $props();
</script>

<article class="relative h-full flex flex-col bg-gradient-to-br from-black to-[#1a1a1a] border-2 border-[#ffd700] rounded-xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,215,0,0.3)] hover:border-white">
	<div class="absolute top-4 left-6 text-6xl md:text-7xl text-[#ffd700] font-serif leading-none opacity-30">
		"
	</div>
	<blockquote class="text-white text-base md:text-[1rem] leading-relaxed mb-6 pt-8 flex-grow italic">
		{quote}
	</blockquote>
	<div class="mt-auto pt-4 border-t border-[#ffd700]/30">
		<div class="text-[#ffd700] font-semibold text-lg mb-1">— {name}</div>
		{#if title}
			<div class="text-[#cccccc] text-sm not-italic">{title}</div>
		{/if}
	</div>
</article>