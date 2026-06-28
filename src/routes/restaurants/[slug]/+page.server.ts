import { error } from '@sveltejs/kit';
import { restaurants } from '$lib/data/restaurants';
import { getRestaurantBySlug } from '$lib/restaurant-helpers';
import { loadStoredUserReviews } from '$lib/server/user-review-store';

export async function load({ params }) {
	const place = getRestaurantBySlug(params.slug);

	if (!place) {
		throw error(404, 'Restaurant not found');
	}

	return {
		place,
		reviewState: await loadStoredUserReviews()
	};
}
