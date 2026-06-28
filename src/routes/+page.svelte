<script lang="ts">
	import { goto } from '$app/navigation';
	import RestaurantMap from '$lib/components/RestaurantMap.svelte';
	import { restaurants } from '$lib/data/restaurants';
	import { DECISION_STATES, RESEARCH_TAGS, type DecisionState, type ResearchTag, type Restaurant } from '$lib/types';
	import { getUserReview, loadUserReviews, saveUserReviews } from '$lib/user-reviews';

	const DEFAULT_VISIBLE_DECISION_STATES: DecisionState[] = [
		'ready-to-review',
		'needs-more-info',
		'approved'
	];

	let searchText = $state('');
	let activeTypes = $state<string[]>([]);
	let activeResearchTags = $state<ResearchTag[]>([]);
	let activeDecisionStates = $state<DecisionState[]>([...DEFAULT_VISIBLE_DECISION_STATES]);
	let reviewState = $state(loadUserReviews());
	const decisionStateLabels: Record<DecisionState, string> = {
		'ready-to-review': 'Ready to review',
		'needs-more-info': 'Needs more info',
		approved: 'Approved',
		rejected: 'Rejected'
	};

	const allTypes = Array.from(new Set(restaurants.map((restaurant) => restaurant.type)));
	const visiblePlaces = $derived.by(() => restaurants.filter(matchesFilters));
	const sortedVisiblePlaces = $derived.by(() =>
		[...visiblePlaces].sort((left, right) => left.name.localeCompare(right.name))
	);

	$effect(() => {
		saveUserReviews(reviewState);
	});

	function toggleType(type: string) {
		activeTypes = activeTypes.includes(type)
			? activeTypes.filter((value) => value !== type)
			: [...activeTypes, type];
	}

	function toggleResearchTag(tag: ResearchTag) {
		activeResearchTags = activeResearchTags.includes(tag)
			? activeResearchTags.filter((value) => value !== tag)
			: [...activeResearchTags, tag];
	}

	function toggleDecisionState(state: DecisionState) {
		activeDecisionStates = activeDecisionStates.includes(state)
			? activeDecisionStates.filter((value) => value !== state)
			: [...activeDecisionStates, state];
	}

	function matchesFilters(restaurant: Restaurant) {
		const review = getUserReview(reviewState, restaurant.slug);
		const visibleResearchTags = getVisibleResearchTags(restaurant);
		const search = searchText.trim().toLowerCase();

		if (
			search &&
			![restaurant.name, restaurant.neighborhood, restaurant.cuisineSummary, restaurant.summary]
				.join(' ')
				.toLowerCase()
				.includes(search)
		) {
			return false;
		}

		if (activeTypes.length > 0 && !activeTypes.includes(restaurant.type)) {
			return false;
		}

		if (activeResearchTags.length > 0 && !activeResearchTags.every((tag) => visibleResearchTags.includes(tag))) {
			return false;
		}

		if (activeDecisionStates.length > 0 && !activeDecisionStates.includes(review.decision)) {
			return false;
		}

		return true;
	}

	function goToRestaurant(slug: string) {
		void goto(restaurantHref(slug));
	}

	function restaurantHref(slug: string) {
		return `/restaurants/${slug}`;
	}

	function getVisibleResearchTags(restaurant: Restaurant) {
		const hiddenResearchTags = getUserReview(reviewState, restaurant.slug).hiddenResearchTags;
		return restaurant.researchTags.filter((tag) => !hiddenResearchTags.includes(tag));
	}
</script>

<svelte:head>
	<title>Chicago Allergy Eats</title>
	<meta
		name="description"
		content="Neighborhood-based Chicago restaurant research with filters, map view, and browser-saved approvals."
	/>
</svelte:head>

<div class="shell">
	<aside class="sidebar">
		<section class="sidebar-card filters">
			<div class="filter-heading">
				<div>
					<p class="eyebrow">Chicago allergy eats</p>
					<h2>Filters</h2>
				</div>
				<button
					type="button"
					class="reset-button"
					onclick={() => {
						searchText = '';
						activeTypes = [];
						activeResearchTags = [];
						activeDecisionStates = [...DEFAULT_VISIBLE_DECISION_STATES];
					}}
				>
					Reset
				</button>
			</div>

			<label class="search-field">
				<span>Search</span>
				<input bind:value={searchText} placeholder="Neighborhood, cuisine, or note" />
			</label>

			<div>
				<h3>Restaurant type</h3>
				<div class="chip-row">
					{#each allTypes as type}
						<button
							type="button"
							class:active={activeTypes.includes(type)}
							class="filter-chip"
							onclick={() => toggleType(type)}
						>
							{type}
						</button>
					{/each}
				</div>
			</div>

			<div>
				<h3>Decision state</h3>
				<div class="chip-row">
					{#each DECISION_STATES as state}
						<button
							type="button"
							class:active={activeDecisionStates.includes(state)}
							class="filter-chip"
							onclick={() => toggleDecisionState(state)}
						>
							{decisionStateLabels[state]}
						</button>
					{/each}
				</div>
			</div>

			<div>
				<h3>Research tags</h3>
				<div class="chip-row">
					{#each RESEARCH_TAGS as tag}
						<button
							type="button"
							class:active={activeResearchTags.includes(tag)}
							class="filter-chip"
							onclick={() => toggleResearchTag(tag)}
						>
							{tag}
						</button>
					{/each}
				</div>
			</div>

		</section>

		<section class="sidebar-card list-card">
			<div class="filter-heading">
				<div>
					<h2>Restaurant list</h2>
					<p class="list-summary">{visiblePlaces.length} visible</p>
				</div>
			</div>

			{#if sortedVisiblePlaces.length > 0}
				<div class="group-list">
					{#each sortedVisiblePlaces as restaurant}
						<a href={restaurantHref(restaurant.slug)} class="place-card">
							<div class="place-card-top">
								<div>
									<strong>{restaurant.name}</strong>
									<p>{restaurant.neighborhood} • {restaurant.type} • {restaurant.meals.join(', ')}</p>
								</div>
								{#if getUserReview(reviewState, restaurant.slug).decision === 'rejected'}
									<span class="rejected-pill">Rejected</span>
								{:else if getUserReview(reviewState, restaurant.slug).decision === 'approved'}
									<span class="approved-pill">Approved</span>
								{:else if getUserReview(reviewState, restaurant.slug).decision === 'needs-more-info'}
									<span class="needs-more-info-pill">Needs more info</span>
								{:else}
									<span class="ready-to-review-pill">Ready to review</span>
								{/if}
							</div>

							{#if restaurant.summary}
								<p class="place-summary">{restaurant.summary}</p>
							{/if}

							<div class="chip-row compact">
								{#each getVisibleResearchTags(restaurant) as tag}
									<span class="info-chip">{tag}</span>
								{/each}
								{#each getUserReview(reviewState, restaurant.slug).personalTags as tag}
									<span class="personal-chip">{tag}</span>
								{/each}
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<p class="empty-state">No places match the current filters.</p>
			{/if}
		</section>
	</aside>

	<section class="workspace">
		<div class="map-shell">
			<RestaurantMap places={visiblePlaces} onSelect={goToRestaurant} />

			<div class="overlay">
				<section class="overview-card">
					<h2>Map-first overview</h2>
					<p>
						Click a card on the left or a marker on the map to open that restaurant’s dedicated page with links, quotes, tags, and working notes.
					</p>

					<div class="overview-grid">
						<div>
							<h3>What is already wired up</h3>
							<ul>
								<li>Searchable restaurant list with type and research tag filters</li>
								<li>Dedicated restaurant pages for deep review</li>
								<li>Browser-saved decision states and comments</li>
								<li>Repo-backed research sources for raw links, PDFs, ideas, and notes</li>
							</ul>
						</div>
					</div>
				</section>
			</div>
		</div>
	</section>
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

	.shell {
		display: grid;
		grid-template-columns: minmax(19rem, 27rem) minmax(0, 1fr);
		min-height: 100vh;
	}

	.sidebar {
		display: grid;
		align-content: start;
		gap: 0.75rem;
		padding: 0.85rem;
		background: rgb(248 250 252 / 0.92);
		backdrop-filter: blur(16px);
		border-right: 1px solid rgb(226 232 240 / 0.95);
		overflow: auto;
	}

	.sidebar-card,
	.overview-card {
		background: rgb(255 255 255 / 0.85);
		border-radius: 1.5rem;
		border: 1px solid rgb(226 232 240 / 0.9);
		box-shadow: 0 16px 40px rgb(15 23 42 / 0.08);
	}

	.sidebar-card {
		padding: 0.9rem;
	}

	.eyebrow {
		margin: 0 0 0.45rem;
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #1d4ed8;
	}

	h2,
	h3,
	p {
		margin-top: 0;
	}

	h2 {
		font-size: 1rem;
		margin-bottom: 0.55rem;
	}

	h3 {
		font-size: 0.9rem;
		margin-bottom: 0.4rem;
	}

	.sidebar-card p,
	.overview-card p,
	.place-summary,
	.empty-state {
		color: #475569;
		line-height: 1.45;
		font-size: 0.9rem;
	}

	.place-card p,
	.approved-pill {
		font-size: 0.8rem;
	}

	.filters {
		display: grid;
		gap: 0.75rem;
	}

	.filter-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.reset-button,
	.filter-chip {
		border: none;
		cursor: pointer;
		font: inherit;
	}

	.reset-button {
		padding: 0.42rem 0.68rem;
		border-radius: 999px;
		background: #e2e8f0;
		color: #0f172a;
		font-size: 0.82rem;
	}

	.search-field {
		display: grid;
		gap: 0.35rem;
		font-size: 0.82rem;
	}

	input {
		width: 100%;
		padding: 0.65rem 0.75rem;
		border-radius: 0.8rem;
		border: 1px solid #cbd5e1;
		font: inherit;
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.filter-chip,
	.info-chip,
	.personal-chip,
	.approved-pill {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.32rem 0.58rem;
		font-size: 0.76rem;
	}

	.filter-chip {
		background: #e2e8f0;
		color: #0f172a;
	}

	.filter-chip.active {
		background: #1d4ed8;
		color: white;
	}

	.list-card {
		min-height: 0;
	}

	.list-summary {
		margin: 0.25rem 0 0;
		font-size: 0.78rem;
		color: #64748b;
	}

	.group-list {
		display: grid;
		gap: 0.8rem;
		max-height: 56vh;
		overflow: auto;
		padding-right: 0.25rem;
	}

	.place-card {
		display: grid;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: 1rem;
		text-decoration: none;
		color: inherit;
		background: white;
		border: 1px solid #e2e8f0;
		transition:
			transform 120ms ease,
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	.place-card:hover {
		transform: translateY(-1px);
		border-color: #93c5fd;
		box-shadow: 0 12px 30px rgb(37 99 235 / 0.14);
	}

	.place-card-top {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.place-card strong {
		font-size: 0.92rem;
	}

	.place-card p {
		margin-bottom: 0;
	}

	.compact {
		gap: 0.4rem;
	}

	.info-chip {
		background: #eff6ff;
		color: #1d4ed8;
	}

	.personal-chip {
		background: #ede9fe;
		color: #6d28d9;
	}

	.approved-pill {
		background: #dcfce7;
		color: #166534;
		white-space: nowrap;
	}

	.rejected-pill {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.32rem 0.58rem;
		font-size: 0.76rem;
		background: #fee2e2;
		color: #b91c1c;
		white-space: nowrap;
	}

	.ready-to-review-pill {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.32rem 0.58rem;
		font-size: 0.76rem;
		background: #e2e8f0;
		color: #475569;
		white-space: nowrap;
	}

	.needs-more-info-pill {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.32rem 0.58rem;
		font-size: 0.76rem;
		background: #fef3c7;
		color: #92400e;
		white-space: nowrap;
	}

	.workspace {
		padding: 1rem;
	}

	.map-shell {
		position: relative;
		height: calc(100vh - 2.5rem);
		border-radius: 2rem;
		overflow: hidden;
		box-shadow: 0 24px 60px rgb(15 23 42 / 0.16);
		background: #dbeafe;
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		padding: 1.25rem;
		pointer-events: none;
	}

	.overview-card {
		max-width: min(44rem, 100%);
		padding: 1.4rem;
		pointer-events: auto;
	}

	.overview-grid {
		display: grid;
		gap: 1rem;
	}

	.overview-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		margin-top: 1rem;
	}

	.overview-card ul {
		margin: 0;
		padding-left: 1rem;
		display: grid;
		gap: 0.45rem;
	}

	@media (max-width: 1100px) {
		.shell {
			grid-template-columns: 1fr;
		}

		.sidebar {
			border-right: none;
			border-bottom: 1px solid rgb(226 232 240 / 0.95);
		}

		.group-list {
			max-height: none;
		}

		.map-shell {
			height: auto;
			min-height: 42rem;
		}
	}

	@media (max-width: 800px) {
		.workspace,
		.sidebar,
		.overlay {
			padding: 1rem;
		}

		.overview-grid {
			grid-template-columns: 1fr;
		}

		.overlay {
			align-items: stretch;
			justify-content: stretch;
		}

		.overview-card {
			max-width: none;
			align-self: end;
		}
	}
</style>
