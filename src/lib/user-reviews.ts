import { browser } from '$app/environment';
import defaultRestaurantDecisions from '$lib/data/imported/restaurant-decisions.json';
import type { DecisionState, ResearchTag, UserReview } from '$lib/types';

export const USER_REVIEWS_STORAGE_KEY = 'chicago-allergy-eats:user-reviews';

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

export function loadUserReviews(): Record<string, UserReview> {
	if (!browser) {
		return {};
	}

	const stored = localStorage.getItem(USER_REVIEWS_STORAGE_KEY);

	if (!stored) {
		return {};
	}

	try {
		const parsed = JSON.parse(stored) as Record<string, unknown>;
		return Object.fromEntries(
			Object.entries(parsed).map(([slug, value]) => [slug, normalizeUserReview(value)])
		);
	} catch {
		return {};
	}
}

export function saveUserReviews(reviewState: Record<string, UserReview>) {
	if (!browser) {
		return;
	}

	localStorage.setItem(USER_REVIEWS_STORAGE_KEY, JSON.stringify(reviewState));
}

export function getUserReview(reviewState: Record<string, UserReview>, slug: string): UserReview {
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

function normalizeUserReview(value: unknown): UserReview {
	const review = typeof value === 'object' && value ? (value as Record<string, unknown>) : {};
	const hiddenResearchTags = Array.isArray(review.hiddenResearchTags)
		? review.hiddenResearchTags.filter((tag): tag is ResearchTag => typeof tag === 'string')
		: [];
	const personalTags = Array.isArray(review.personalTags)
		? review.personalTags.filter((tag): tag is string => typeof tag === 'string')
		: [];
	const rejectionNote = typeof review.rejectionNote === 'string' ? review.rejectionNote : undefined;
	const comment = typeof review.comment === 'string' ? review.comment : undefined;

	if (
		review.decision === 'approved' ||
		review.decision === 'rejected' ||
		review.decision === 'ready-to-review' ||
		review.decision === 'needs-more-info'
	) {
		return {
			decision: review.decision as DecisionState,
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
