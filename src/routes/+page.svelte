<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import RestaurantMap from '$lib/components/RestaurantMap.svelte';
	import { restaurants } from '$lib/data/restaurants';
	import type { PageData } from './$types';
	import {
		DECISION_STATES,
		RESEARCH_TAGS,
		type DecisionState,
		type ResearchTag,
		type Restaurant,
		type RestaurantType
	} from '$lib/types';
	import { getUserReview, loadUserReviews } from '$lib/user-reviews';

	let { data }: { data: PageData } = $props();

	const DEFAULT_VISIBLE_DECISION_STATES: DecisionState[] = [
		'ready-to-review',
		'needs-more-info',
		'awaiting-restaurant-response',
		'approved'
	];
	const HOMEPAGE_FILTERS_STORAGE_KEY = 'chicago-allergy-eats:homepage-filters';
	const allTypes = Array.from(new Set(restaurants.map((restaurant) => restaurant.type)));
	const persistedFilters = loadHomepageFilters();

	let searchText = $state(persistedFilters.searchText);
	let activeTypes = $state<string[]>(persistedFilters.activeTypes);
	let activeResearchTags = $state<ResearchTag[]>(persistedFilters.activeResearchTags);
	let activeDecisionStates = $state<DecisionState[]>(persistedFilters.activeDecisionStates);
	let reviewState = $state(loadUserReviews({}));
	let hoveredSlug = $state<string | null>(null);
	const decisionStateLabels: Record<DecisionState, string> = {
		'ready-to-review': 'Ready to review',
		'needs-more-info': 'Needs more info',
		'awaiting-restaurant-response': 'Awaiting restaurant response',
		approved: 'Approved',
		rejected: 'Rejected'
	};

	const visiblePlaces = $derived.by(() => restaurants.filter(matchesFilters));
	const sortedVisiblePlaces = $derived.by(() =>
		[...visiblePlaces].sort((left, right) => left.name.localeCompare(right.name))
	);
	const markerDecisions = $derived.by(() =>
		Object.fromEntries(restaurants.map((restaurant) => [restaurant.slug, getUserReview(reviewState, restaurant.slug).decision]))
	);

	$effect(() => {
		reviewState = loadUserReviews(data.reviewState);
	});

	$effect(() => {
		if (!browser) {
			return;
		}

		const nextFilters = {
			searchText,
			activeTypes,
			activeResearchTags,
			activeDecisionStates
		};

		localStorage.setItem(HOMEPAGE_FILTERS_STORAGE_KEY, JSON.stringify(nextFilters));
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

	function loadHomepageFilters() {
		if (!browser) {
			return defaultHomepageFilters();
		}

		const stored = localStorage.getItem(HOMEPAGE_FILTERS_STORAGE_KEY);

		if (!stored) {
			return defaultHomepageFilters();
		}

		try {
			const parsed = JSON.parse(stored) as Record<string, unknown>;
			const normalizedActiveTypes = Array.isArray(parsed.activeTypes)
				? Array.from(
						new Set(
							parsed.activeTypes.flatMap((type) => {
								if (type === 'Cafe') {
									return ['Sit-down'];
								}

								return [type];
							})
						)
					)
				: [];

			return {
				searchText: typeof parsed.searchText === 'string' ? parsed.searchText : '',
				activeTypes: normalizedActiveTypes.filter(
							(type): type is RestaurantType =>
								typeof type === 'string' && allTypes.includes(type as RestaurantType)
						),
				activeResearchTags: Array.isArray(parsed.activeResearchTags)
					? parsed.activeResearchTags.filter(
							(tag): tag is ResearchTag => typeof tag === 'string' && RESEARCH_TAGS.includes(tag as ResearchTag)
						)
					: [],
				activeDecisionStates: Array.isArray(parsed.activeDecisionStates)
					? parsed.activeDecisionStates.filter(
							(state): state is DecisionState =>
								typeof state === 'string' && DECISION_STATES.includes(state as DecisionState)
						)
					: [...DEFAULT_VISIBLE_DECISION_STATES]
			};
		} catch {
			return defaultHomepageFilters();
		}
	}

	function defaultHomepageFilters() {
		return {
			searchText: '',
			activeTypes: [],
			activeResearchTags: [] as ResearchTag[],
			activeDecisionStates: [...DEFAULT_VISIBLE_DECISION_STATES]
		};
	}
</script>

<svelte:head>
	<title>Chicago Allergy Eats</title>
	<meta
		name="description"
		content="Neighborhood-based Chicago restaurant research with filters, map view, and JSON-backed review decisions."
	/>
</svelte:head>

<div class="shell">
	<aside class="sidebar">
		<section class="sidebar-card filters">
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
						<a
							href={restaurantHref(restaurant.slug)}
							class="place-card"
							class:hovered={hoveredSlug === restaurant.slug}
							onmouseenter={() => {
								hoveredSlug = restaurant.slug;
							}}
							onmouseleave={() => {
								if (hoveredSlug === restaurant.slug) {
									hoveredSlug = null;
								}
							}}
							onfocus={() => {
								hoveredSlug = restaurant.slug;
							}}
							onblur={() => {
								if (hoveredSlug === restaurant.slug) {
									hoveredSlug = null;
								}
							}}
						>
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
								{:else if getUserReview(reviewState, restaurant.slug).decision === 'awaiting-restaurant-response'}
									<span class="awaiting-response-pill">Awaiting restaurant response</span>
								{:else}
									<span class="ready-to-review-pill">Ready to review</span>
								{/if}
							</div>

							{#if restaurant.summary}
								<p class="place-summary">{restaurant.summary}</p>
							{/if}

							{#if getUserReview(reviewState, restaurant.slug).decision === 'rejected' && getUserReview(reviewState, restaurant.slug).rejectionNote}
								<p class="rejection-note-preview">
									<strong>Why:</strong> {getUserReview(reviewState, restaurant.slug).rejectionNote}
								</p>
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
			<RestaurantMap
				places={visiblePlaces}
				selectedSlug={hoveredSlug}
				onSelect={goToRestaurant}
				initialCenter={[41.8848, -87.6296]}
				initialZoom={15}
				showHotelMarker
				{markerDecisions}
				centerOnSelected
			/>

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
	.shell {
		display: grid;
		grid-template-columns: minmax(19rem, 2fr) minmax(0, 3fr);
		min-height: 100vh;
	}

	.sidebar {
		display: grid;
		align-content: start;
		gap: 0.75rem;
		padding: 0.85rem;
		background: var(--panel-muted-bg);
		backdrop-filter: blur(16px);
		border-right: 1px solid var(--panel-border);
		overflow: auto;
	}

	.sidebar-card,
	.overview-card {
		background: var(--panel-bg);
		border-radius: 1.5rem;
		border: 1px solid var(--panel-border);
		box-shadow: var(--panel-shadow-soft);
	}

	.sidebar-card {
		padding: 0.9rem;
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
	.empty-state,
	.rejection-note-preview {
		color: var(--text-secondary);
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

	.filter-chip {
		border: none;
		cursor: pointer;
		font: inherit;
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
		border: 1px solid var(--input-border);
		background: var(--input-bg);
		color: var(--text-primary);
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
		background: var(--chip-bg);
		color: var(--chip-text);
	}

	.filter-chip.active {
		background: var(--accent);
		color: #ffffff;
	}

	.list-card {
		min-height: 0;
	}

	.list-summary {
		margin: 0.25rem 0 0;
		font-size: 0.78rem;
		color: var(--text-muted);
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
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		transition:
			transform 120ms ease,
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	.place-card:hover {
		transform: translateY(-1px);
		border-color: var(--card-hover-border);
		box-shadow: var(--card-hover-shadow);
	}

	.place-card.hovered {
		transform: translateY(-1px);
		border-color: var(--card-hover-border-strong);
		box-shadow: var(--card-hover-shadow-strong);
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

	.rejection-note-preview {
		margin: 0;
		padding: 0.6rem 0.7rem;
		border-radius: 0.85rem;
		background: var(--status-rejected-bg);
		color: var(--status-rejected-text);
	}

	.rejection-note-preview strong {
		color: inherit;
	}

	.compact {
		gap: 0.4rem;
	}

	.info-chip {
		background: var(--chip-info-bg);
		color: var(--chip-info-text);
	}

	.personal-chip {
		background: var(--chip-personal-bg);
		color: var(--chip-personal-text);
	}

	.approved-pill {
		background: var(--status-approved-bg);
		color: var(--status-approved-text);
		white-space: nowrap;
	}

	.rejected-pill {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.32rem 0.58rem;
		font-size: 0.76rem;
		background: var(--status-rejected-bg);
		color: var(--status-rejected-text);
		white-space: nowrap;
	}

	.ready-to-review-pill {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.32rem 0.58rem;
		font-size: 0.76rem;
		background: var(--status-ready-bg);
		color: var(--status-ready-text);
		white-space: nowrap;
	}

	.needs-more-info-pill {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.32rem 0.58rem;
		font-size: 0.76rem;
		background: var(--status-needs-bg);
		color: var(--status-needs-text);
		white-space: nowrap;
	}

	.awaiting-response-pill {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.32rem 0.58rem;
		font-size: 0.76rem;
		background: var(--status-awaiting-bg);
		color: var(--status-awaiting-text);
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
		box-shadow: var(--panel-shadow-strong);
		background: var(--map-shell-bg);
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
			border-bottom: 1px solid var(--panel-border);
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
