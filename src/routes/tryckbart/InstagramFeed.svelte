<script lang="ts">
	type InstagramPost = {
		id: string;
		media_url: string;
		permalink: string;
		caption?: string;
	};

	let {
		posts = [],
		error = null,
		profileUrl = ''
	} = $props<{ posts?: InstagramPost[]; error?: string | null; profileUrl?: string }>();

	const displayedPosts = $derived(posts?.slice(0, 6) ?? []);
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6">
	<div class="flex items-center justify-between mb-4">
		<div>
			<p class="text-sm text-gray-500">Instagram</p>
			<h2 class="text-xl font-semibold text-gray-900">Senaste inläggen</h2>
		</div>
		{#if profileUrl}
			<a
				href={profileUrl}
				class="text-sm text-orange-600 hover:text-orange-700 font-medium"
				target="_blank"
				rel="noreferrer">
				Öppna profil
			</a>
		{/if}
	</div>

	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{:else if displayedPosts.length === 0}
		<p class="text-sm text-gray-600">Inga inlägg tillgängliga just nu.</p>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			{#each displayedPosts as post}
				<a
					href={post.permalink}
					class="group relative block overflow-hidden rounded-lg border border-gray-200"
					target="_blank"
					rel="noreferrer">
					<img
						src={post.media_url}
						alt={post.caption ?? 'Instagram post'}
						class="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-105"
						loading="lazy" />
					<div class="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
					{#if post.caption}
						<p class="absolute bottom-2 left-2 right-2 text-xs text-white bg-black/50 rounded px-2 py-1 max-h-16 overflow-hidden">
							{post.caption}
						</p>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>
