<script lang="ts">
	import type { DecisionState, Restaurant, UserReview } from '$lib/types';

	let {
		place,
		review,
		fullPage = false,
		onSetDecision,
		onSetRejected,
		onAddPersonalTag,
		onRemovePersonalTag
	}: {
		place: Restaurant;
		review: UserReview;
		fullPage?: boolean;
		onSetDecision: (decision: DecisionState) => void;
		onSetRejected: (note: string) => void;
		onAddPersonalTag: (tag: string) => void;
		onRemovePersonalTag: (tag: string) => void;
	} = $props();

	let newTag = $state('');
	let showRejectForm = $state(false);
	let rejectionDraft = $state('');

	function handleTagSubmit(event: SubmitEvent) {
		event.preventDefault();
		const nextTag = newTag.trim();

		if (!nextTag) {
			return;
		}

		onAddPersonalTag(nextTag);
		newTag = '';
	}

	function handleRejectSubmit(event: SubmitEvent) {
		event.preventDefault();
		const note = rejectionDraft.trim();

		if (!note) {
			return;
		}

		onSetRejected(note);
		showRejectForm = false;
	}

	const selectedDecision = $derived(showRejectForm ? 'rejected' : review.decision);

	function handleDecisionChange(event: Event) {
		const nextDecision = (event.currentTarget as HTMLSelectElement).value as DecisionState;

		if (nextDecision === 'rejected') {
			rejectionDraft = review.rejectionNote ?? '';
			showRejectForm = true;
			return;
		}

		showRejectForm = false;
		rejectionDraft = '';
		onSetDecision(nextDecision);
	}
</script>

<article class:full-page={fullPage} class="detail-card">
	<header class="detail-header">
		<div>
			<p class="eyebrow">{place.neighborhood}</p>
			<h1>{place.name}</h1>
			{#if place.summary}
				<p class="summary">{place.summary}</p>
			{/if}
		</div>

		<label class="status-field">
			<span>Status</span>
			<select value={selectedDecision} onchange={handleDecisionChange}>
				<option value="unverified">Unverified</option>
				<option value="approved">Approved</option>
				<option value="rejected">Rejected</option>
			</select>
		</label>
	</header>

	{#if showRejectForm}
		<section class="decision-card">
			<h2>Why reject this place?</h2>
			<form class="reject-form" onsubmit={handleRejectSubmit}>
				<textarea
					bind:value={rejectionDraft}
					name="rejection-note"
					rows="4"
					placeholder="Add the reason so you can remember later"
				></textarea>
				<div class="decision-actions">
					<button type="submit" class="reject-action">Save rejection</button>
					<button
						type="button"
						class="clear-button"
						onclick={() => {
							showRejectForm = false;
							rejectionDraft = review.rejectionNote ?? '';
						}}
					>
						Cancel
					</button>
				</div>
			</form>
		</section>
	{/if}

	<section class="meta-grid">
		<div>
			<h2>Quick read</h2>
			<ul>
				<li><strong>Type:</strong> {place.type}</li>
				<li><strong>Food:</strong> {place.cuisineSummary}</li>
				<li><strong>Meals:</strong> {place.meals.join(', ')}</li>
				<li><strong>Address:</strong> {place.address}</li>
				{#if place.phone}
					<li><strong>Phone:</strong> {place.phone}</li>
				{/if}
				{#if place.rating}
					<li><strong>Google rating:</strong> {place.rating.toFixed(1)}</li>
				{/if}
			</ul>
		</div>

		<div>
			<h2>Research tags</h2>
			<div class="chip-row">
				{#if place.researchTags.length > 0}
					{#each place.researchTags as tag}
						<span class="chip">{tag}</span>
					{/each}
				{:else}
					<span class="empty-chip">No research tags yet</span>
				{/if}
			</div>

			<h2>Your tags</h2>
			<div class="chip-row">
				{#if review.personalTags.length > 0}
					{#each review.personalTags as tag}
						<button type="button" class="chip removable-chip" onclick={() => onRemovePersonalTag(tag)}>
							{tag} <span aria-hidden="true">×</span>
						</button>
					{/each}
				{:else}
					<span class="empty-chip">No personal tags yet</span>
				{/if}
			</div>

			<form class="tag-form" onsubmit={handleTagSubmit}>
				<input bind:value={newTag} name="tag" placeholder="Add a custom tag" />
				<button type="submit">Add tag</button>
			</form>
		</div>
	</section>

	<section>
		<h2>Links</h2>
		{#if place.resources.length > 0}
			<div class="link-list">
				{#each place.resources as resource}
					<a href={resource.href} target="_blank" rel="noreferrer">
						<span>{resource.label}</span>
						<span class="link-kind">{resource.kind}</span>
					</a>
				{/each}
			</div>
		{:else}
			<p class="empty-state">No saved links yet. Add menu, website, review, or allergen links in the data files.</p>
		{/if}
	</section>

	<section>
		<h2>Pull-out quotes</h2>
		{#if place.quotes.length > 0}
			<div class="quote-list">
				{#each place.quotes as quote}
					<blockquote>
						<p>“{quote.quote}”</p>
						<footer>
							{#if quote.href}
								<a href={quote.href} target="_blank" rel="noreferrer">{quote.sourceLabel}</a>
							{:else}
								<span>{quote.sourceLabel}</span>
							{/if}
						</footer>
					</blockquote>
				{/each}
			</div>
		{:else}
			<p class="empty-state">No saved quotes yet.</p>
		{/if}
	</section>
</article>

<style>
	.detail-card {
		display: grid;
		gap: 1.25rem;
		background: rgb(255 255 255 / 0.9);
		backdrop-filter: blur(16px);
		border: 1px solid rgb(226 232 240 / 0.92);
		border-radius: 1.5rem;
		padding: 1.5rem;
		box-shadow: 0 20px 50px rgb(15 23 42 / 0.12);
		max-height: min(82vh, 72rem);
		overflow: auto;
	}

	.detail-card.full-page {
		max-height: none;
		overflow: visible;
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: start;
	}

	.eyebrow {
		margin: 0 0 0.35rem;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #1d4ed8;
	}

	h1 {
		margin: 0;
		font-size: clamp(1.75rem, 3vw, 2.35rem);
		line-height: 1.1;
	}

	.summary {
		margin: 0.6rem 0 0;
		color: #334155;
		line-height: 1.6;
	}

	button,
	select {
		border: none;
		font: inherit;
	}

	button,
	select,
	.tag-form button {
		padding: 0.8rem 1rem;
		border-radius: 0.9rem;
		font-weight: 700;
	}

	.reject-action {
		background: #fee2e2;
		color: #b91c1c;
		cursor: pointer;
	}

	.status-field {
		display: grid;
		gap: 0.45rem;
		min-width: 12rem;
		font-size: 0.82rem;
		font-weight: 700;
		color: #334155;
	}

	.status-field span {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.74rem;
	}

	.status-field select {
		border: 1px solid #cbd5e1;
		background: white;
		color: #0f172a;
		cursor: pointer;
	}

	.decision-card {
		display: grid;
		gap: 0.85rem;
		padding: 1rem 1.1rem;
		border-radius: 1rem;
		background: white;
		border: 1px solid #e2e8f0;
	}

	.decision-card h2 {
		margin: 0;
	}

	.meta-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.25rem;
	}

	h2 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
	}

	ul {
		margin: 0;
		padding-left: 1rem;
		display: grid;
		gap: 0.45rem;
	}

	.chip-row,
	.link-list,
	.quote-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.chip,
	.empty-chip {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.45rem 0.8rem;
		font-size: 0.9rem;
		background: #eff6ff;
		color: #1d4ed8;
	}

	.empty-chip {
		background: #f1f5f9;
		color: #64748b;
	}

	.removable-chip {
		background: #ede9fe;
		color: #6d28d9;
	}

	.tag-form {
		display: flex;
		gap: 0.65rem;
		margin-top: 0.85rem;
	}

	input {
		flex: 1;
		border-radius: 0.9rem;
		border: 1px solid #cbd5e1;
		padding: 0.8rem 0.95rem;
		font: inherit;
	}

	textarea {
		width: 100%;
		border-radius: 0.9rem;
		border: 1px solid #cbd5e1;
		padding: 0.8rem 0.95rem;
		font: inherit;
		resize: vertical;
	}

	.tag-form button {
		background: #1d4ed8;
		color: white;
	}

	.reject-form {
		display: grid;
		gap: 0.8rem;
	}

	.decision-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.clear-button {
		padding: 0.8rem 1rem;
		border-radius: 999px;
		background: #e2e8f0;
		color: #0f172a;
		font-weight: 700;
	}

	.link-list a {
		display: grid;
		gap: 0.25rem;
		padding: 0.9rem 1rem;
		border-radius: 1rem;
		background: white;
		border: 1px solid #e2e8f0;
		text-decoration: none;
		color: inherit;
		min-width: 12rem;
	}

	.link-kind {
		font-size: 0.82rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #64748b;
	}

	blockquote {
		margin: 0;
		padding: 1rem 1.1rem;
		border-left: 4px solid #1d4ed8;
		border-radius: 0.9rem;
		background: white;
		flex: 1 1 16rem;
	}

	blockquote p {
		margin: 0 0 0.55rem;
		line-height: 1.6;
	}

	blockquote footer {
		font-size: 0.9rem;
		color: #64748b;
	}

	.empty-state {
		margin: 0;
		color: #64748b;
	}

	@media (max-width: 900px) {
		.detail-card {
			max-height: none;
		}

		.detail-header,
		.meta-grid,
		.tag-form {
			grid-template-columns: 1fr;
			display: grid;
		}
	}
</style>
