import { env } from '$env/dynamic/public';
import { loadStoredUserReviews } from '$lib/server/user-review-store';

export async function load() {
	return {
		reviewReadOnly: env.PUBLIC_READ_ONLY_REVIEW_STATE === 'true',
		reviewState: await loadStoredUserReviews()
	};
}
