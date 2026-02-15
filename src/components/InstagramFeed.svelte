<script lang="ts">
	interface InstagramPost {
		id: string;
		caption?: string;
		media_url: string;
		permalink: string;
		thumbnail_url?: string;
		media_type?: string;
		timestamp?: string;
	}

	let { posts = [] } = $props<{ posts?: InstagramPost[] }>();
	const hasPosts = $derived(posts.length > 0);
</script>

<section class="mt-16">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-2xl font-semibold text-gray-900">Instagram</h2>
		<p class="text-sm text-gray-500">Senaste inlägg</p>
	</div>

	{#if hasPosts}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
			{#each posts as post}
				<a
					href={post.permalink}
					target="_blank"
					rel="noreferrer noopener"
					class="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
					<div class="relative aspect-square bg-gray-100">
						{#if post.media_type === 'VIDEO' && post.thumbnail_url}
							<img src={post.thumbnail_url} alt={post.caption ?? 'Instagram video'} class="h-full w-full object-cover" loading="lazy" />
						{:else}
							<img src={post.media_url} alt={post.caption ?? 'Instagram post'} class="h-full w-full object-cover" loading="lazy" />
						{/if}
						<div class="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20"></div>
					</div>
					<div class="p-3">
						<p class="text-sm text-gray-700">{post.caption ?? 'Visa på Instagram'}</p>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-gray-600">
			<p>Inga Instagram-inlägg kunde hämtas just nu.</p>
			<p class="mt-1 text-sm text-gray-500">Verifiera INSTAGRAM_ACCESS_TOKEN eller försök igen senare.</p>
		</div>
	{/if}
</section>
