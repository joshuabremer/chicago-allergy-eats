<script lang="ts">
	import RestaurantDetail from '$lib/components/RestaurantDetail.svelte';
	import RestaurantMap from '$lib/components/RestaurantMap.svelte';
	import type { PageData } from './$types';
	import type { DecisionState, UserReview } from '$lib/types';
	import { getUserReview, loadUserReviews, saveUserReviews } from '$lib/user-reviews';

	let { data }: { data: PageData } = $props();

	let reviewState = $state<Record<string, UserReview>>(loadUserReviews());

	$effect(() => {
		saveUserReviews(reviewState);
	});

	function setDecision(decision: DecisionState) {
		reviewState = {
			...reviewState,
			[data.place.slug]: {
				...getUserReview(reviewState, data.place.slug),
				decision,
				rejectionNote:
					decision === 'rejected' ? getUserReview(reviewState, data.place.slug).rejectionNote : undefined
			}
		};
	}

	function setRejected(note: string) {
		reviewState = {
			...reviewState,
			[data.place.slug]: {
				...getUserReview(reviewState, data.place.slug),
				decision: 'rejected',
				rejectionNote: note
			}
		};
	}

	function addPersonalTag(tag: string) {
		const normalizedTag = tag.trim();

		if (!normalizedTag) {
			return;
		}

		if (
			getUserReview(reviewState, data.place.slug).personalTags.some(
				(value) => value.toLowerCase() === normalizedTag.toLowerCase()
			)
		) {
			return;
		}

		reviewState = {
			...reviewState,
			[data.place.slug]: {
				...getUserReview(reviewState, data.place.slug),
				personalTags: [...getUserReview(reviewState, data.place.slug).personalTags, normalizedTag]
			}
		};
	}

	function removePersonalTag(tag: string) {
		reviewState = {
			...reviewState,
			[data.place.slug]: {
				...getUserReview(reviewState, data.place.slug),
				personalTags: getUserReview(reviewState, data.place.slug).personalTags.filter((value) => value !== tag)
			}
		};
	}
</script>

<svelte:head>
	<title>{data.place.name} | Chicago Allergy Eats</title>
	<meta name="description" content={data.place.summary} />
</svelte:head>

<div class="page-shell">
	<header class="page-header">
		<a href="/" class="back-link">← Back to neighborhood list</a>
		<div>
			<p class="eyebrow">{data.place.neighborhood}</p>
			<h1>{data.place.name}</h1>
			<p>{data.place.cuisineSummary}</p>
		</div>
	</header>

	<div class="content-grid">
		<div class="detail-column">
			<RestaurantDetail
				place={data.place}
				review={getUserReview(reviewState, data.place.slug)}
				fullPage={true}
				onSetDecision={setDecision}
				onSetRejected={setRejected}
				onAddPersonalTag={addPersonalTag}
				onRemovePersonalTag={removePersonalTag}
			/>
		</div>

		<aside class="side-column">
			<section class="map-card">
				<h2>Map location</h2>
				<div class="map-wrapper">
					<RestaurantMap places={[data.place]} selectedSlug={data.place.slug} />
				</div>
			</section>
		</aside>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background:
			linear-gradient(180deg, #fff7ed 0%, #eff6ff 38%, #f8fafc 100%);
		color: #0f172a;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.page-shell {
		min-height: 100vh;
		padding: 1.5rem;
		display: grid;
		gap: 1.25rem;
	}

	.page-header,
	.map-card {
		background: rgb(255 255 255 / 0.9);
		border: 1px solid rgb(226 232 240 / 0.92);
		border-radius: 1.5rem;
		box-shadow: 0 20px 50px rgb(15 23 42 / 0.1);
	}

	.page-header {
		padding: 1.4rem;
		display: grid;
		gap: 1rem;
	}

	.back-link {
		color: #1d4ed8;
		text-decoration: none;
		font-weight: 700;
	}

	.eyebrow {
		margin: 0 0 0.35rem;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #1d4ed8;
	}

	h1,
	h2,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0.6rem;
		font-size: clamp(1.9rem, 3vw, 2.6rem);
		line-height: 1.1;
	}

	.page-header p:last-child {
		margin-bottom: 0;
		color: #475569;
		line-height: 1.6;
	}

	.content-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.7fr) minmax(20rem, 0.9fr);
		gap: 1.25rem;
		align-items: start;
	}

	.detail-column,
	.side-column {
		min-width: 0;
	}

	.side-column {
		display: grid;
		gap: 1rem;
		position: sticky;
		top: 1.5rem;
	}

	.map-card {
		padding: 1.2rem;
	}

	.map-card h2 {
		margin-bottom: 0.85rem;
	}

	.map-wrapper {
		border-radius: 1rem;
		overflow: hidden;
		border: 1px solid #dbeafe;
	}

	@media (max-width: 1100px) {
		.content-grid {
			grid-template-columns: 1fr;
		}

		.side-column {
			position: static;
		}
	}

	@media (max-width: 800px) {
		.page-shell {
			padding: 1rem;
		}
	}
</style>
