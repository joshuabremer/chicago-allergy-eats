import { loadStoredUserReviews } from '$lib/server/user-review-store';

export async function load() {
	return {
		reviewState: await loadStoredUserReviews()
	};
}
