<script lang="ts">
	import type { DecisionState, ResearchTag, Restaurant, UserReview } from '$lib/types';

	let {
		place,
		review,
		fullPage = false,
		onSetDecision,
		onSetRejected,
		onSetComment,
		onHideResearchTag
	}: {
		place: Restaurant;
		review: UserReview;
		fullPage?: boolean;
		onSetDecision: (decision: DecisionState) => void;
		onSetRejected: (note: string) => void;
		onSetComment: (comment: string) => void;
		onHideResearchTag: (tag: ResearchTag) => void;
	} = $props();

	let showRejectForm = $state(false);
	let rejectionDraft = $state('');
	let commentDraft = $state('');

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

	function handleCommentSubmit(event: SubmitEvent) {
		event.preventDefault();
		onSetComment(commentDraft);
	}

	$effect(() => {
		commentDraft = review.comment ?? '';
	});

	const visibleResearchTags = $derived(
		place.researchTags.filter((tag) => !review.hiddenResearchTags.includes(tag))
	);
	const analysisFlags = $derived(place.resources.flatMap((resource) => resource.menuFlags ?? []));
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
				<option value="ready-to-review">Ready to review</option>
				<option value="needs-more-info">Needs more info</option>
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
				{#if place.email}
					<li><strong>Email:</strong> <a href={`mailto:${place.email}`}>{place.email}</a></li>
				{/if}
				{#if place.rating}
					<li><strong>Google rating:</strong> {place.rating.toFixed(1)}</li>
				{/if}
			</ul>
		</div>

		<div>
			<h2>Research tags</h2>
			<div class="chip-row">
				{#if visibleResearchTags.length > 0}
					{#each visibleResearchTags as tag}
						<button type="button" class="chip removable-chip" onclick={() => onHideResearchTag(tag)}>
							<span>{tag}</span>
							<span class="chip-dismiss" aria-hidden="true">×</span>
						</button>
					{/each}
				{:else}
					<span class="empty-chip">No research tags yet</span>
				{/if}
			</div>
		</div>
	</section>

	<section>
		<h2>Links</h2>
		{#if place.resources.length > 0}
			<div class="link-list">
				{#each place.resources as resource}
					<a href={resource.href} target="_blank" rel="noreferrer" class="link-entry">
						<span class="link-label">{resource.label}</span>
						<span class="link-kind">{resource.kind}</span>
					</a>
				{/each}
			</div>
		{:else}
			<p class="empty-state">No saved links yet. Add menu, website, review, or allergen links in the data files.</p>
		{/if}
	</section>

	{#if analysisFlags.length > 0}
		<section>
			<h2>Analysis</h2>
			<div class="analysis-list">
				{#each analysisFlags as flag}
					<p class="analysis-flag">
						<span aria-hidden="true">{flag.tone === 'green' ? '👍' : '🚩'}</span>
						<span>{flag.note}</span>
					</p>
				{/each}
			</div>
		</section>
	{/if}

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

	<section>
		<h2>Comments</h2>
		<form class="comment-form" onsubmit={handleCommentSubmit}>
			<textarea
				bind:value={commentDraft}
				name="comment"
				rows="4"
				placeholder="Add any notes or follow-up questions for this restaurant"
			></textarea>
			<div class="comment-actions">
				<button type="submit" class="save-button">Save comment</button>
				{#if review.comment}
					<button
						type="button"
						class="clear-button"
						onclick={() => {
							commentDraft = '';
							onSetComment('');
						}}
					>
						Clear
					</button>
				{/if}
			</div>
		</form>
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
	select {
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
	.quote-list,
	.analysis-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.link-list,
	.analysis-list {
		display: grid;
		gap: 0.35rem;
	}

	.analysis-flag {
		margin: 0;
		display: flex;
		align-items: start;
		gap: 0.5rem;
		font-size: 0.92rem;
		line-height: 1.5;
		color: #334155;
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
		border: none;
		cursor: pointer;
		gap: 0.45rem;
	}

	.chip-dismiss {
		font-size: 1rem;
		line-height: 1;
	}

	textarea {
		width: 100%;
		border-radius: 0.9rem;
		border: 1px solid #cbd5e1;
		padding: 0.8rem 0.95rem;
		font: inherit;
		resize: vertical;
	}

	.reject-form {
		display: grid;
		gap: 0.8rem;
	}

	.comment-form {
		display: grid;
		gap: 0.8rem;
	}

	.comment-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.decision-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.save-button {
		background: #1d4ed8;
		color: white;
		cursor: pointer;
	}

	.clear-button {
		padding: 0.8rem 1rem;
		border-radius: 999px;
		background: #e2e8f0;
		color: #0f172a;
		font-weight: 700;
	}

	.link-entry {
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
		padding: 0.2rem 0;
		text-decoration: none;
		color: #1d4ed8;
		width: fit-content;
	}

	.link-label {
		line-height: 1.4;
	}

	.link-kind {
		font-size: 0.8rem;
		color: #64748b;
		text-transform: none;
		letter-spacing: normal;
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
		.meta-grid {
			grid-template-columns: 1fr;
			display: grid;
		}
	}
</style>
