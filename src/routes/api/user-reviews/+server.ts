import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

import { loadStoredUserReviews, saveStoredUserReviews } from '$lib/server/user-review-store';
import { normalizeUserReviewState } from '$lib/user-reviews';

export async function GET() {
	return json(await loadStoredUserReviews());
}

export async function PUT({ request }) {
	if (env.PUBLIC_READ_ONLY_REVIEW_STATE === 'true') {
		throw error(403, 'Review state is read-only on this deployment.');
	}

	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		throw error(400, 'User review payload must be valid JSON.');
	}

	if (!isObjectRecord(payload)) {
		throw error(400, 'User review payload must be an object keyed by slug.');
	}

	return json(await saveStoredUserReviews(normalizeUserReviewState(payload)));
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
