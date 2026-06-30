import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
import { restaurants } from '$lib/data/restaurants';
import { getRestaurantBySlug } from '$lib/restaurant-helpers';
import { loadStoredUserReviews } from '$lib/server/user-review-store';

export function entries() {
	return restaurants.map((restaurant) => ({ slug: restaurant.slug }));
}

export async function load({ params }) {
	const place = getRestaurantBySlug(params.slug);

	if (!place) {
		throw error(404, 'Restaurant not found');
	}

	return {
		place,
		reviewReadOnly: env.PUBLIC_READ_ONLY_REVIEW_STATE === 'true',
		reviewState: await loadStoredUserReviews()
	};
}
