<script>
	import ReferenceCard from './ReferenceCard.svelte';

	let { references } = $props();
</script>

<section class="references-section">
	<div class="container">
		<h2 class="section-title">Referenser</h2>
		<div class="references-grid">
			{#each references as reference}
				<ReferenceCard
					quote={reference.quote}
					name={reference.name}
					title={reference.title} />
			{/each}
		</div>
	</div>
</section>

<style>
	.references-section {
		background: #0a0a0a;
		padding: 4rem 0;
		min-height: 100vh;
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.section-title {
		color: #ffd700;
		font-size: 3rem;
		font-weight: 700;
		text-align: center;
		margin-bottom: 3rem;
		text-transform: uppercase;
		letter-spacing: 2px;
		position: relative;
	}

	.section-title::after {
		content: '';
		display: block;
		width: 100px;
		height: 4px;
		background: linear-gradient(90deg, transparent, #ffd700, transparent);
		margin: 1rem auto 0;
	}

	.references-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		margin-top: 3rem;
	}

	@media (max-width: 1024px) {
		.references-grid {
			gap: 1.5rem;
		}
	}

	@media (max-width: 768px) {
		.references-section {
			padding: 3rem 0;
		}

		.container {
			padding: 0 1rem;
		}

		.section-title {
			font-size: 2rem;
			margin-bottom: 2rem;
		}

		.references-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}
</style>

