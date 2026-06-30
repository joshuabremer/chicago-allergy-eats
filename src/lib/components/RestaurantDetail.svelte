<script lang="ts">
	import type { DecisionState, ResearchTag, Restaurant, UserReview } from '$lib/types';

	let {
		place,
		review,
		reviewReadOnly = false,
		fullPage = false,
		onSetDecision,
		onSetRejected,
		onSetComment,
		onHideResearchTag,
		onRemovePersonalTag
	}: {
		place: Restaurant;
		review: UserReview;
		reviewReadOnly?: boolean;
		fullPage?: boolean;
		onSetDecision: (decision: DecisionState) => void | Promise<void>;
		onSetRejected: (note: string) => void | Promise<void>;
		onSetComment: (comment: string) => void | Promise<void>;
		onHideResearchTag: (tag: ResearchTag) => void | Promise<void>;
		onRemovePersonalTag: (tag: string) => void | Promise<void>;
	} = $props();

	let showRejectForm = $state(false);
	let rejectionDraft = $state('');
	let commentDraft = $state('');
	let lastSyncedComment = $state<string | undefined>(undefined);
	const savedComment = $derived(review.comment ?? '');
	const commentIsDirty = $derived(commentDraft.trim() !== savedComment);

	function handleRejectSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (reviewReadOnly) {
			return;
		}

		const note = rejectionDraft.trim();

		if (!note) {
			return;
		}

		onSetRejected(note);
		showRejectForm = false;
	}

	const selectedDecision = $derived(showRejectForm ? 'rejected' : review.decision);

	function handleDecisionChange(event: Event) {
		if (reviewReadOnly) {
			return;
		}

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

	function handleCommentSave() {
		if (reviewReadOnly) {
			return;
		}

		const normalizedComment = commentDraft.trim();
		lastSyncedComment = normalizedComment || undefined;
		commentDraft = normalizedComment;
		onSetComment(normalizedComment);
	}

	$effect(() => {
		if (review.comment !== lastSyncedComment) {
			lastSyncedComment = review.comment;
			commentDraft = review.comment ?? '';
		}
	});

	const visibleResearchTags = $derived(
		place.researchTags.filter((tag) => !review.hiddenResearchTags.includes(tag))
	);
	const analysisFlags = $derived(
		place.resources
			.filter((resource) => resource.kind === 'menu')
			.flatMap((resource) => resource.menuFlags ?? [])
	);
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
			<select value={selectedDecision} onchange={handleDecisionChange} disabled={reviewReadOnly}>
				<option value="ready-to-review">Ready to review</option>
				<option value="needs-more-info">Needs more info</option>
				<option value="awaiting-restaurant-response">Awaiting restaurant response</option>
				<option value="approved">Approved</option>
				<option value="rejected">Rejected</option>
			</select>
		</label>
	</header>

	{#if reviewReadOnly}
		<section class="decision-card read-only-card">
			<p>
				This deployment is read-only. Use your local git-backed copy to change statuses, comments, or hidden tags.
			</p>
		</section>
	{/if}

	{#if showRejectForm}
		<section class="decision-card">
			<h2>Why reject this place?</h2>
			<form class="reject-form" onsubmit={handleRejectSubmit}>
				<textarea
					bind:value={rejectionDraft}
					name="rejection-note"
					rows="4"
					placeholder="Add the reason so you can remember later"
					disabled={reviewReadOnly}
				></textarea>
				<div class="decision-actions">
					<button type="submit" class="reject-action" disabled={reviewReadOnly}>Save rejection</button>
					<button
						type="button"
						class="clear-button"
						disabled={reviewReadOnly}
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

	{#if review.decision === 'rejected' && review.rejectionNote}
		<section class="decision-card rejection-note-card">
			<h2>Why this was rejected</h2>
			<p class="rejection-note">{review.rejectionNote}</p>
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
						{#if reviewReadOnly}
							<span class="chip">{tag}</span>
						{:else}
							<button type="button" class="chip removable-chip" onclick={() => onHideResearchTag(tag)}>
								<span>{tag}</span>
								<span class="chip-dismiss" aria-hidden="true">×</span>
							</button>
						{/if}
					{/each}
				{:else}
					<span class="empty-chip">No research tags yet</span>
				{/if}
				{#each review.personalTags as tag}
					{#if reviewReadOnly}
						<span class="chip personal-chip">{tag}</span>
					{:else}
						<button type="button" class="chip personal-chip removable-chip" onclick={() => onRemovePersonalTag(tag)}>
							<span>{tag}</span>
							<span class="chip-dismiss" aria-hidden="true">×</span>
						</button>
					{/if}
				{/each}
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
		<section class="analysis-section">
			<h2>Menu analysis</h2>
			<div class="analysis-list">
				{#each analysisFlags as flag}
					<div class:yellow-flag={flag.tone === 'yellow'} class:red-flag={flag.tone === 'red'} class="analysis-flag">
						<span class="analysis-icon" aria-hidden="true">
							{flag.tone === 'green' ? '✅' : flag.tone === 'yellow' ? '⚠️' : '🚩'}
						</span>
						<span>{flag.note}</span>
					</div>
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
		<div class="comment-form">
			<textarea
				bind:value={commentDraft}
				name="comment"
				rows="4"
				placeholder="Add any notes or follow-up questions for this restaurant"
				disabled={reviewReadOnly}
				onblur={handleCommentSave}
			></textarea>
			<div class="comment-actions">
				<button type="button" class="save-button" onclick={handleCommentSave} disabled={reviewReadOnly || !commentIsDirty}>
					{commentIsDirty ? 'Save comment' : 'Saved'}
				</button>
				{#if review.comment}
					<button
						type="button"
						class="clear-button"
						disabled={reviewReadOnly}
						onclick={() => {
							commentDraft = '';
							onSetComment('');
						}}
					>
						Clear
					</button>
				{/if}
			</div>
		</div>
	</section>
</article>

<style>
	.detail-card {
		display: grid;
		gap: 1.25rem;
		background: var(--panel-bg);
		backdrop-filter: blur(16px);
		border: 1px solid var(--panel-border);
		border-radius: 1.5rem;
		padding: 1.5rem;
		box-shadow: var(--panel-shadow);
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
		color: var(--accent);
	}

	h1 {
		margin: 0;
		font-size: clamp(1.75rem, 3vw, 2.35rem);
		line-height: 1.1;
	}

	.summary {
		margin: 0.6rem 0 0;
		color: var(--text-secondary);
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
		background: var(--danger-bg);
		color: var(--danger-text);
		cursor: pointer;
	}

	.status-field {
		display: grid;
		gap: 0.45rem;
		min-width: 12rem;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text-secondary);
	}

	.status-field span {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.74rem;
	}

	.status-field select {
		border: 1px solid var(--input-border);
		background: var(--input-bg);
		color: var(--text-primary);
		cursor: pointer;
	}

	.decision-card {
		display: grid;
		gap: 0.85rem;
		padding: 1rem 1.1rem;
		border-radius: 1rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
	}

	.decision-card h2 {
		margin: 0;
	}

	.rejection-note-card {
		gap: 0.55rem;
	}

	.read-only-card p {
		margin: 0;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.rejection-note {
		margin: 0;
		color: var(--text-secondary);
		line-height: 1.6;
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
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--analysis-green);
		padding: 0;
		border: none;
		background: transparent;
	}

	.analysis-flag.yellow-flag {
		color: var(--analysis-yellow);
	}

	.analysis-flag.red-flag {
		color: var(--analysis-red);
	}

	.analysis-icon {
		flex: 0 0 auto;
		line-height: 1.3;
	}

	.chip,
	.empty-chip {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		padding: 0.45rem 0.8rem;
		font-size: 0.9rem;
		background: var(--chip-info-bg);
		color: var(--chip-info-text);
	}

	.empty-chip {
		background: var(--chip-empty-bg);
		color: var(--chip-empty-text);
	}

	.personal-chip {
		background: var(--chip-personal-bg);
		color: var(--chip-personal-text);
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
		border: 1px solid var(--input-border);
		background: var(--input-bg);
		color: var(--text-primary);
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
		background: var(--accent);
		color: #ffffff;
		cursor: pointer;
	}


	.clear-button {
		padding: 0.8rem 1rem;
		border-radius: 999px;
		background: var(--button-secondary-bg);
		color: var(--button-secondary-text);
		font-weight: 700;
	}

	button:disabled,
	select:disabled,
	textarea:disabled {
		cursor: not-allowed;
		opacity: 0.65;
	}

	.link-entry {
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
		padding: 0.2rem 0;
		text-decoration: none;
		color: var(--accent);
		width: fit-content;
	}

	.link-label {
		line-height: 1.4;
	}

	.link-kind {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-transform: none;
		letter-spacing: normal;
	}

	blockquote {
		margin: 0;
		padding: 1rem 1.1rem;
		border-left: 4px solid var(--quote-border);
		border-radius: 0.9rem;
		background: var(--quote-bg);
		flex: 1 1 16rem;
	}

	blockquote p {
		margin: 0 0 0.55rem;
		line-height: 1.6;
		font-style: italic;
	}

	blockquote footer {
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.empty-state {
		margin: 0;
		color: var(--text-muted);
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
