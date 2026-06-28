import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { normalizeUserReviewState, sortUserReviewState, type UserReviewState } from '$lib/user-reviews';

const USER_REVIEW_STORE_PATH = resolve(process.cwd(), 'data/user-reviews.json');

export async function loadStoredUserReviews(): Promise<UserReviewState> {
	try {
		const stored = await readFile(USER_REVIEW_STORE_PATH, 'utf8');
		return normalizeUserReviewState(JSON.parse(stored));
	} catch (error: unknown) {
		if (isMissingFileError(error)) {
			return {};
		}

		throw error;
	}
}

export async function saveStoredUserReviews(reviewState: UserReviewState): Promise<UserReviewState> {
	const normalizedReviewState = sortUserReviewState(normalizeUserReviewState(reviewState));

	await mkdir(dirname(USER_REVIEW_STORE_PATH), { recursive: true });
	await writeFile(
		USER_REVIEW_STORE_PATH,
		`${JSON.stringify(normalizedReviewState, null, 2)}\n`,
		'utf8'
	);

	return normalizedReviewState;
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
	return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
