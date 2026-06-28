import defaultRestaurantDecisions from '$lib/data/imported/restaurant-decisions.json';
import {
	DECISION_STATES,
	RESEARCH_TAGS,
	type DecisionState,
	type ResearchTag,
	type UserReview
} from '$lib/types';

const RESEARCH_TAG_MIGRATIONS: Partial<Record<string, ResearchTag>> = {
	'Can confidently accommodate': 'Can accommodate'
};
export type UserReviewState = Record<string, UserReview>;

type DefaultRestaurantDecision = {
	slug: string;
	decision: DecisionState;
	rejectionNote?: string;
};

const DEFAULT_REVIEW_BY_SLUG = new Map(
	(defaultRestaurantDecisions as DefaultRestaurantDecision[]).map((entry) => [
		entry.slug,
		{
			decision: entry.decision,
			rejectionNote: entry.decision === 'rejected' ? entry.rejectionNote : undefined,
			comment: undefined,
			hiddenResearchTags: [],
			personalTags: []
		}
	])
);

export function loadUserReviews(initialState: unknown): UserReviewState {
	return normalizeUserReviewState(initialState);
}

export async function saveUserReviews(reviewState: UserReviewState): Promise<UserReviewState> {
	const response = await fetch('/api/user-reviews', {
		method: 'PUT',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify(sortUserReviewState(reviewState))
	});

	if (!response.ok) {
		throw new Error(`Failed to save user reviews (${response.status}).`);
	}

	return normalizeUserReviewState(await response.json());
}

export function getUserReview(reviewState: UserReviewState, slug: string): UserReview {
	return (
		reviewState[slug] ??
		DEFAULT_REVIEW_BY_SLUG.get(slug) ?? {
			decision: 'ready-to-review',
			rejectionNote: undefined,
			comment: undefined,
			hiddenResearchTags: [],
			personalTags: []
		}
	);
}

export function normalizeUserReviewState(value: unknown): UserReviewState {
	if (!isObjectRecord(value)) {
		throw new TypeError('User review payload must be an object keyed by slug.');
	}

	return Object.fromEntries(
		Object.entries(value).map(([slug, reviewValue]) => [slug, normalizeUserReview(reviewValue)])
	);
}

export function sortUserReviewState(reviewState: UserReviewState): UserReviewState {
	return Object.fromEntries(
		Object.entries(reviewState).sort(([leftSlug], [rightSlug]) => leftSlug.localeCompare(rightSlug))
	);
}

function normalizeUserReview(value: unknown): UserReview {
	const review = typeof value === 'object' && value ? (value as Record<string, unknown>) : {};
	const hiddenResearchTags = Array.isArray(review.hiddenResearchTags)
		? Array.from(
				new Set(
					review.hiddenResearchTags
						.map((tag) => normalizeResearchTag(tag))
						.filter((tag): tag is ResearchTag => Boolean(tag))
				)
			)
		: [];
	const personalTags = Array.isArray(review.personalTags)
		? review.personalTags.filter((tag): tag is string => typeof tag === 'string')
		: [];
	const rejectionNote = typeof review.rejectionNote === 'string' ? review.rejectionNote : undefined;
	const comment = typeof review.comment === 'string' ? review.comment : undefined;

	if (isDecisionState(review.decision)) {
		return {
			decision: review.decision,
			rejectionNote: review.decision === 'rejected' ? rejectionNote : undefined,
			comment,
			hiddenResearchTags,
			personalTags
		};
	}

	const approved = review.approved === true;
	const rejected = review.rejected === true;
	const decision: DecisionState = rejected ? 'rejected' : approved ? 'approved' : 'ready-to-review';

	return {
		decision,
		rejectionNote: decision === 'rejected' ? rejectionNote : undefined,
		comment,
		hiddenResearchTags,
		personalTags
	};
}

function normalizeResearchTag(tag: unknown): ResearchTag | undefined {
	if (typeof tag !== 'string') {
		return undefined;
	}

	const normalizedTag = RESEARCH_TAG_MIGRATIONS[tag] ?? tag;
	return RESEARCH_TAGS.includes(normalizedTag as ResearchTag) ? (normalizedTag as ResearchTag) : undefined;
}

function isDecisionState(value: unknown): value is DecisionState {
	return typeof value === 'string' && DECISION_STATES.includes(value as DecisionState);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
