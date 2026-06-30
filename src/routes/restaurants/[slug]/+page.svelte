<script lang="ts">
	import RestaurantDetail from '$lib/components/RestaurantDetail.svelte';
	import RestaurantMap from '$lib/components/RestaurantMap.svelte';
	import type { PageData } from './$types';
	import type { DecisionState, ResearchTag, UserReview } from '$lib/types';
	import { getUserReview, loadUserReviews, saveUserReviews } from '$lib/user-reviews';

	let { data }: { data: PageData } = $props();

	let reviewState = $state<Record<string, UserReview>>(loadUserReviews({}));

	$effect(() => {
		reviewState = loadUserReviews(data.reviewState);
	});

	async function setDecision(decision: DecisionState) {
		reviewState = await saveUserReviews({
			...reviewState,
			[data.place.slug]: {
				...getUserReview(reviewState, data.place.slug),
				decision,
				rejectionNote:
					decision === 'rejected' ? getUserReview(reviewState, data.place.slug).rejectionNote : undefined
			}
		});
	}

	async function setRejected(note: string) {
		reviewState = await saveUserReviews({
			...reviewState,
			[data.place.slug]: {
				...getUserReview(reviewState, data.place.slug),
				decision: 'rejected',
				rejectionNote: note
			}
		});
	}

	async function setComment(comment: string) {
		const normalizedComment = comment.trim();

		reviewState = await saveUserReviews({
			...reviewState,
			[data.place.slug]: {
				...getUserReview(reviewState, data.place.slug),
				comment: normalizedComment || undefined
			}
		});
	}

	async function hideResearchTag(tag: ResearchTag) {
		const review = getUserReview(reviewState, data.place.slug);

		if (review.hiddenResearchTags.includes(tag)) {
			return;
		}

		reviewState = await saveUserReviews({
			...reviewState,
			[data.place.slug]: {
				...review,
				hiddenResearchTags: [...review.hiddenResearchTags, tag]
			}
		});
	}

	async function removePersonalTag(tag: string) {
		const review = getUserReview(reviewState, data.place.slug);

		if (!review.personalTags.includes(tag)) {
			return;
		}

		reviewState = await saveUserReviews({
			...reviewState,
			[data.place.slug]: {
				...review,
				personalTags: review.personalTags.filter((value) => value !== tag)
			}
		});
	}
</script>

<svelte:head>
	<title>{data.place.name} | Chicago Allergy Eats</title>
	<meta name="description" content={data.place.summary} />
</svelte:head>

<div class="page-shell">
	<a href="/" class="back-link">← Back to restaurant list</a>

	<div class="content-grid">
		<div class="detail-column">
			<RestaurantDetail
				place={data.place}
				review={getUserReview(reviewState, data.place.slug)}
				reviewReadOnly={data.reviewReadOnly}
				fullPage={true}
				onSetDecision={setDecision}
				onSetRejected={setRejected}
				onSetComment={setComment}
				onHideResearchTag={hideResearchTag}
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
	.page-shell {
		min-height: 100vh;
		padding: 1.5rem;
		display: grid;
		gap: 1.25rem;
	}

	.map-card {
		background: var(--panel-bg);
		border: 1px solid var(--panel-border);
		border-radius: 1.5rem;
		box-shadow: var(--panel-shadow);
	}

	.back-link {
		color: var(--accent);
		text-decoration: none;
		font-weight: 700;
	}

	h2 {
		margin-top: 0;
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
		border: 1px solid var(--map-frame);
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
