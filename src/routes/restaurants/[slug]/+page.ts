import { error } from '@sveltejs/kit';
import { restaurants } from '$lib/data/restaurants';
import { getRestaurantBySlug } from '$lib/restaurant-helpers';

export const prerender = true;

export function entries() {
	return restaurants.map((restaurant) => ({ slug: restaurant.slug }));
}

export function load({ params }) {
	const place = getRestaurantBySlug(params.slug);

	if (!place) {
		throw error(404, 'Restaurant not found');
	}

	return {
		place
	};
}
