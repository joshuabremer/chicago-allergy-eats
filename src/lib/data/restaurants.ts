import dinnerReservations from '$lib/data/imported/dinner-reservations.json';
import googleMapsDetails from '$lib/data/imported/google-maps-details.json';
import manualRestaurantResearch from '$lib/data/imported/manual-restaurant-research.json';
import restaurantConversations from '$lib/data/imported/restaurant-conversations.json';
import probablyOkRestaurants from '$lib/data/imported/restaurants-that-are-probably-ok.json';
import accommodatingRestaurants from '$lib/data/imported/restaurants-that-can-accommodate.json';
import restaurantsToVerify from '$lib/data/imported/restaurants-to-verify.json';
import treeNutFreeRestaurants from '$lib/data/imported/tree-nut-free-restaurants.json';
import allThingsAllergiesGuide from '../../../data/raw/chicago-2026/articles/parsed/allthingsallergies-chicago-guide.json';
import spokinChicagoItinerary from '../../../data/raw/chicago-2026/articles/parsed/spokin-chicago-travel-itinerary.json';
import spokinFavorites from '../../../data/raw/chicago-2026/articles/parsed/spokin-alyssa-favorite-nut-friendly-chicago-spots.json';
import { RESEARCH_TAGS } from '$lib/types';
import type {
	MealService,
	ResourceLink,
	ResourceKind,
	ResearchTag,
	Restaurant,
	RestaurantType,
	SourceQuote
} from '$lib/types';

type GeoJsonCollection = {
	name: string;
	features: GeoJsonFeature[];
};

type GeoJsonFeature = {
	properties: {
		Name: string;
	};
	geometry: {
		coordinates: number[];
	};
};

type MapCollection = {
	title: string;
	data: GeoJsonCollection;
	researchTags: ResearchTag[];
};

type SupplementalRestaurant = {
	title: string;
	name: string;
	latitude: number;
	longitude: number;
	researchTags: ResearchTag[];
	address?: string;
	website?: string;
	phone?: string;
};

type ArticlePlace = {
	name: string;
	sourceLink?: string;
	location?: string;
	quote?: string;
};

type ArticleStop = {
	label: string;
	name: string;
	sourceLink?: string | null;
	quote?: string | null;
};

type ArticleSectionEntry = {
	name: string;
	sourceLink: string;
	notes: string[];
};

type ParsedArticle = {
	title: string;
	sourceName: string;
	articleUrl: string;
	places?: ArticlePlace[];
	stops?: ArticleStop[];
	sections?: {
		section: string;
		entries: ArticleSectionEntry[];
	}[];
};

type ArticleReference = {
	articleTitle: string;
	articleUrl: string;
	sourceName: string;
	placeLink?: string | null;
	quote?: string | null;
	notes?: string[];
};

type WorkingRestaurant = {
	slug: string;
	name: string;
	originalName: string;
	canonicalKey: string;
	neighborhood: string;
	address: string;
	phone?: string;
	rating?: number;
	type: RestaurantType;
	cuisineSummary: string;
	summary: string;
	meals: MealService[];
	researchTags: Set<ResearchTag>;
	sourceTitles: Set<string>;
	latitude: number;
	longitude: number;
	resources: ResourceLink[];
	quotes: SourceQuote[];
	notes: string[];
};

type GoogleMapsDetail = {
	name: string;
	address: string;
	website: string;
	phone?: string;
	rating?: number;
	latitude: number;
	longitude: number;
};

type RestaurantConversation = {
	restaurantName: string;
	date: string;
	contactName: string;
	contactEmail: string;
	responseQuote: string;
	summary: string;
	researchTags: ResearchTag[];
	website?: string;
	address?: string;
	phone?: string;
	latitude?: number;
	longitude?: number;
	addToList?: boolean;
	decision?: string;
};

type ManualRestaurantResearch = {
	restaurantName: string;
	researchTags?: ResearchTag[];
	resources?: ResourceLink[];
	quotes?: SourceQuote[];
	notes?: string[];
};

const MAP_COLLECTIONS: MapCollection[] = [
	{
		title: 'Restaurants that can Accommodate',
		data: accommodatingRestaurants,
		researchTags: ['Can confidently accommodate']
	},
	{
		title: 'Restaurants to Verify',
		data: restaurantsToVerify,
		researchTags: []
	},
	{
		title: 'Tree Nut Free Restaurants',
		data: treeNutFreeRestaurants,
		researchTags: ['Nut free menu']
	},
	{
		title: 'Restaurants that are Probably OK',
		data: probablyOkRestaurants,
		researchTags: ['Probably OK']
	},
	{
		title: 'Dinner Reservations',
		data: dinnerReservations,
		researchTags: ['Reservation target']
	}
];

const ARTICLE_SOURCES: ParsedArticle[] = [
	spokinFavorites,
	spokinChicagoItinerary,
	allThingsAllergiesGuide
];

const SUPPLEMENTAL_RESTAURANTS: SupplementalRestaurant[] = [
	{
		title: 'Manual additions',
		name: 'Beatrix Fulton Market',
		latitude: 41.8863,
		longitude: -87.6493,
		researchTags: []
	},
	{
		title: 'Manual additions',
		name: 'Beatrix River North',
		latitude: 41.8905,
		longitude: -87.63,
		researchTags: []
	},
	{
		title: 'Manual additions',
		name: 'Beatrix Streeterville',
		latitude: 41.8946,
		longitude: -87.6222,
		researchTags: []
	},
	{
		title: 'Direct restaurant response',
		name: 'Piccolo Sogno',
		latitude: 41.8908567,
		longitude: -87.6478315,
		researchTags: ['Can confidently accommodate'],
		address: '464 N Halsted St, Chicago, IL 60642',
		website: 'https://piccolosognorestaurant.com',
		phone: '+1 312-421-0077'
	},
	{
		title: 'Direct restaurant response',
		name: 'RPM Seafood',
		latitude: 41.887936,
		longitude: -87.630635,
		researchTags: ['Can confidently accommodate'],
		address: '317 N Clark St, Chicago, IL 60654',
		website: 'https://www.rpmrestaurants.com/rpm-seafood/'
	},
	{
		title: 'Direct restaurant response',
		name: 'Beatnik on the River',
		latitude: 41.88592,
		longitude: -87.63724,
		researchTags: [],
		address: '180 N Wacker Dr, Chicago, IL 60606',
		website: 'https://beatnikontheriver.com',
		phone: '+1 312-526-3345'
	},
	{
		title: 'Manual additions',
		name: 'Tacombi Fulton Market',
		latitude: 41.8836,
		longitude: -87.6496,
		researchTags: [],
		address: '126 N Peoria St, Chicago, IL 60607',
		website: 'https://tacombi.com',
		phone: '+1 312-600-7039'
	},
	{
		title: 'Manual additions',
		name: 'Epic Burger',
		latitude: 41.8977275,
		longitude: -87.6265873,
		researchTags: [],
		address: '40 E Pearson St, Chicago, IL 60611',
		website: 'https://epicburger.com',
		phone: '+1 312-257-3262'
	},
	{
		title: 'Manual additions',
		name: 'Epic Burger',
		latitude: 41.9110998,
		longitude: -87.6537471,
		researchTags: [],
		address: '1000 W North Ave, Chicago, IL 60642',
		website: 'https://epicburger.com',
		phone: '+1 312-978-2326'
	},
	{
		title: 'Manual additions',
		name: 'Eataly',
		latitude: 41.8921864,
		longitude: -87.6262542,
		researchTags: [],
		address: '43 E Ohio St, Chicago, IL 60611',
		website: 'https://www.eataly.com/us_en/stores/chicago/restaurants/wine-bar-chicago',
		phone: '+1 312-521-8700'
	},
	{
		title: 'Manual additions',
		name: 'Au Cheval',
		latitude: 41.8847068,
		longitude: -87.6476011,
		researchTags: [],
		address: '800 W Randolph St, Chicago, IL 60607',
		website: 'https://www.auchevaldiner.com/chicago/home',
		phone: '+1 312-929-4580'
	},
	{
		title: 'Manual additions',
		name: 'Del Sur Bakery',
		latitude: 41.9662871,
		longitude: -87.6789329,
		researchTags: [],
		address: '4639 N Damen Ave, Chicago, IL 60625'
	}
];

const NORMALIZED_NAME_ALIASES: Record<string, string> = {
	'beatnik-on-the-river': 'beatnik-on-the-river',
	'beatrix-fulton-market': 'beatrix',
	'beatrix-river-north': 'beatrix',
	'beatrix-streeterville': 'beatrix',
	bibibop: 'bibibop-asian-grill',
	cindys: 'cindys-rooftop',
	'epic-burger': 'epic-burger',
	'frio-gelato': 'frio-gelato-evanston',
	'frio-gelato-evanston': 'frio-gelato-evanston',
	'ginos-east-south-loop': 'ginos-east',
	'girl-the-goat': 'girl-and-the-goat',
	'jeni-s-splendid-ice-creams': 'jenis-splendid-ice-creams',
	'jenis-splendid-ice-creams': 'jenis-splendid-ice-creams',
	'lou-malnatis-pizzeria': 'lou-malnatis-pizzeria',
	'paulie-gees': 'paulie-gees',
	'piccolo-sogno': 'piccolo-sogno',
	'portillos': 'portillos',
	'portillos-and-barnellis-chicago': 'portillos',
	'portillos-chicago': 'portillos',
	'portillos-chicago-addison': 'portillos',
	'portillos-chicago-canal-and-taylor': 'portillos',
	'ramen-san': 'ramen-san',
	'ramen-san-deluxe': 'ramen-san',
	'ramen-san-lincoln-park': 'ramen-san',
	'ramen-san-whisky-bar': 'ramen-san',
	'rpm-seafood': 'rpm-seafood',
	'seoul-taco': 'seoul-taco',
	'small-cheval': 'small-cheval',
	'small-cheval-fulton-market': 'small-cheval',
	'small-cheval-gold-coast': 'small-cheval',
	'small-cheval-lincoln-park': 'small-cheval',
	'small-cheval-old-town': 'small-cheval',
	'small-cheval-riverside': 'small-cheval',
	'small-cheval-wicker-park': 'small-cheval',
	'the-fat-shallot-food-truck': 'the-fat-shallot',
	'the-fat-shallot-lincoln-park': 'the-fat-shallot',
	'the-fat-shallot-sterling-food-hall': 'the-fat-shallot',
	'wheats-end': 'wheats-end'
};

export const restaurants: Restaurant[] = buildRestaurants();

function buildRestaurants(): Restaurant[] {
	const articleIndex = buildArticleIndex();
	const conversationIndex = buildConversationIndex();
	const manualResearchIndex = buildManualResearchIndex();
	const googleMapsIndex = googleMapsDetails as GoogleMapsDetail[];
	const groupedRestaurants = new Map<string, WorkingRestaurant>();

	for (const collection of MAP_COLLECTIONS) {
		for (const feature of collection.data.features) {
			const name = cleanRestaurantName(feature.properties.Name);
			const longitude = feature.geometry.coordinates[0];
			const latitude = feature.geometry.coordinates[1];
			const canonicalKey = normalizeRestaurantName(name);

			if (shouldExcludeLocation(canonicalKey, latitude, longitude)) {
				continue;
			}

			const locationKey = buildLocationKey(name, latitude, longitude);
			const existing = groupedRestaurants.get(locationKey);

			if (existing) {
				addCollectionMetadata(existing, collection);
				continue;
			}

			const neighborhood = guessNeighborhood(name, latitude, longitude);
			const references = articleIndex.get(canonicalKey) ?? [];
			const type = guessRestaurantType(name, references);
			const workingRestaurant: WorkingRestaurant = {
				slug: buildSlug(canonicalKey, latitude, longitude),
				name,
				originalName: name,
				canonicalKey,
				neighborhood,
				address: buildApproximateAddress(latitude, longitude),
				phone: undefined,
				rating: undefined,
				type,
				cuisineSummary: guessCuisineSummary(name, type),
				summary: '',
				meals: guessMeals(name, type),
				researchTags: new Set(collection.researchTags),
				sourceTitles: new Set([collection.title]),
				latitude,
				longitude,
				resources: [],
				quotes: [],
				notes: []
			};

			applyArticleReferences(workingRestaurant, references);
			applyManualResearchData(workingRestaurant, manualResearchIndex.get(canonicalKey) ?? []);
			applyConversationData(workingRestaurant, conversationIndex.get(canonicalKey) ?? []);
			applyGoogleMapsDetails(
				workingRestaurant,
				findMatchingGoogleMapsDetail(workingRestaurant.originalName, latitude, longitude, googleMapsIndex)
			);
			addCollectionMetadata(workingRestaurant, collection);
			finalizeWorkingRestaurant(workingRestaurant);
			groupedRestaurants.set(locationKey, workingRestaurant);
		}
	}

	for (const restaurant of SUPPLEMENTAL_RESTAURANTS) {
		const canonicalKey = normalizeRestaurantName(restaurant.name);

		if (shouldExcludeLocation(canonicalKey, restaurant.latitude, restaurant.longitude)) {
			continue;
		}

		const locationKey = buildLocationKey(restaurant.name, restaurant.latitude, restaurant.longitude);

		if (groupedRestaurants.has(locationKey)) {
			continue;
		}

		const neighborhood = guessNeighborhood(restaurant.name, restaurant.latitude, restaurant.longitude);
		const references = articleIndex.get(canonicalKey) ?? [];
		const conversations = conversationIndex.get(canonicalKey) ?? [];
		const type = guessRestaurantType(restaurant.name, references);
		const workingRestaurant: WorkingRestaurant = {
			slug: buildSlug(canonicalKey, restaurant.latitude, restaurant.longitude),
			name: restaurant.name,
			originalName: restaurant.name,
			canonicalKey,
			neighborhood,
			address: buildApproximateAddress(restaurant.latitude, restaurant.longitude),
			phone: restaurant.phone,
			rating: undefined,
			type,
			cuisineSummary: guessCuisineSummary(restaurant.name, type),
			summary: '',
			meals: guessMeals(restaurant.name, type),
			researchTags: new Set(restaurant.researchTags),
			sourceTitles: new Set([restaurant.title]),
			latitude: restaurant.latitude,
			longitude: restaurant.longitude,
			resources: [],
			quotes: [],
			notes: [`Added from ${restaurant.title.toLowerCase()}.`]
		};

		applyArticleReferences(workingRestaurant, references);
		applyManualResearchData(workingRestaurant, manualResearchIndex.get(canonicalKey) ?? []);
		applyConversationData(workingRestaurant, conversations);
		applySupplementalDetails(workingRestaurant, restaurant);
		applyGoogleMapsDetails(
			workingRestaurant,
			findMatchingGoogleMapsDetail(workingRestaurant.originalName, restaurant.latitude, restaurant.longitude, googleMapsIndex)
		);
		finalizeWorkingRestaurant(workingRestaurant);
		groupedRestaurants.set(locationKey, workingRestaurant);
	}

	const labeledRestaurants = labelDuplicateLocations([...groupedRestaurants.values()]);

	return labeledRestaurants
		.map((restaurant) => {
			const quotes = dedupeQuotes(restaurant.quotes);

			return {
				slug: restaurant.slug,
				name: restaurant.name,
				neighborhood: restaurant.neighborhood,
				address: restaurant.address,
				phone: restaurant.phone,
				rating: restaurant.rating,
				type: restaurant.type,
				cuisineSummary: restaurant.cuisineSummary,
				summary: restaurant.summary,
				meals: restaurant.meals,
				researchTags: [...restaurant.researchTags].sort(compareResearchTags),
				latitude: restaurant.latitude,
				longitude: restaurant.longitude,
				resources: removeQuotedResources(dedupeResources(restaurant.resources), quotes),
				quotes,
				notes: dedupeStrings(restaurant.notes)
			};
		})
		.sort((left, right) => {
			const neighborhoodOrder = compareText(left.neighborhood, right.neighborhood);

			if (neighborhoodOrder !== 0) {
				return neighborhoodOrder;
			}

			return compareText(left.name, right.name);
		});
}

function applyGoogleMapsDetails(restaurant: WorkingRestaurant, detail?: GoogleMapsDetail) {
	if (!detail) {
		return;
	}

	restaurant.address = detail.address;
	restaurant.phone = detail.phone;
	restaurant.rating = detail.rating;
	restaurant.resources.unshift({
		label: 'Official website',
		href: detail.website,
		kind: 'website'
	});
}

function applySupplementalDetails(restaurant: WorkingRestaurant, supplemental: SupplementalRestaurant) {
	if (supplemental.address) {
		restaurant.address = supplemental.address;
	}

	if (supplemental.phone) {
		restaurant.phone = supplemental.phone;
	}

	if (supplemental.website) {
		restaurant.resources.unshift({
			label: 'Official website',
			href: supplemental.website,
			kind: 'website'
		});
	}
}

function applyManualResearchData(restaurant: WorkingRestaurant, researchEntries: ManualRestaurantResearch[]) {
	for (const entry of researchEntries) {
		for (const tag of entry.researchTags ?? []) {
			restaurant.researchTags.add(tag);
		}

		for (const resource of entry.resources ?? []) {
			restaurant.resources.push(resource);
		}

		for (const quote of entry.quotes ?? []) {
			restaurant.quotes.push(quote);
		}

		for (const note of entry.notes ?? []) {
			restaurant.notes.push(note);
		}
	}
}

function applyArticleReferences(restaurant: WorkingRestaurant, references: ArticleReference[]) {
	if (references.length === 0) {
		return;
	}

	restaurant.researchTags.add('Has great reviews');

	for (const reference of references) {
		restaurant.resources.push({
			label: `${reference.articleTitle} (${reference.sourceName})`,
			href: reference.articleUrl,
			kind: 'review'
		});

		if (reference.placeLink && shouldAddPlaceLinkResource(reference.placeLink)) {
			restaurant.resources.push({
				label: `${reference.sourceName} linked site`,
				href: reference.placeLink,
				kind: guessResourceKind(reference.placeLink)
			});
		}

		if (reference.quote) {
			restaurant.quotes.push({
				quote: stripWrappingQuotes(reference.quote),
				sourceLabel: reference.articleTitle,
				href: reference.articleUrl
			});
		}

		for (const note of reference.notes ?? []) {
			restaurant.notes.push(note);
		}
	}

	deriveTagsFromReferences(restaurant, references);
}

function addCollectionMetadata(restaurant: WorkingRestaurant, collection: MapCollection) {
	restaurant.sourceTitles.add(collection.title);

	for (const tag of collection.researchTags) {
		restaurant.researchTags.add(tag);
	}
}

function finalizeWorkingRestaurant(restaurant: WorkingRestaurant) {
	const sourceSummary = [...restaurant.sourceTitles].sort(compareText).join(', ');

	restaurant.summary = '';
	restaurant.notes.unshift(`Raw source collections: ${sourceSummary}.`);

	if (restaurant.address.startsWith('Map pin only for now')) {
		restaurant.notes.push('Exact address is still pending; this entry currently uses the map pin location.');
	}

	restaurant.notes.push('Neighborhood is estimated from the imported pin and can be refined later.');
}

function labelDuplicateLocations(restaurantsToLabel: WorkingRestaurant[]) {
	const groups = groupBy(restaurantsToLabel, (restaurant) => restaurant.originalName);

	for (const group of groups.values()) {
		if (group.length < 2) {
			continue;
		}

		const byNeighborhood = groupBy(group, (restaurant) => restaurant.neighborhood);

		for (const restaurantsInNeighborhood of byNeighborhood.values()) {
			restaurantsInNeighborhood
				.sort((left, right) => compareCoordinates(left.latitude, left.longitude, right.latitude, right.longitude))
				.forEach((restaurant, index) => {
					const suffix =
						restaurantsInNeighborhood.length > 1
							? `${restaurant.neighborhood} ${index + 1}`
							: restaurant.neighborhood;
					restaurant.name = `${restaurant.originalName} (${suffix})`;
				});
		}
	}

	return restaurantsToLabel;
}

function buildArticleIndex() {
	const articleIndex = new Map<string, ArticleReference[]>();

	for (const source of ARTICLE_SOURCES) {
		for (const place of source.places ?? []) {
			addArticleReference(articleIndex, normalizeRestaurantName(place.name), {
				articleTitle: source.title,
				articleUrl: source.articleUrl,
				sourceName: source.sourceName,
				placeLink: place.sourceLink,
				quote: place.quote
			});
		}

		for (const stop of source.stops ?? []) {
			if (!stop.quote) {
				continue;
			}

			addArticleReference(articleIndex, normalizeRestaurantName(stop.name), {
				articleTitle: source.title,
				articleUrl: source.articleUrl,
				sourceName: source.sourceName,
				placeLink: stop.sourceLink,
				quote: stop.quote
			});
		}

		for (const section of source.sections ?? []) {
			for (const entry of section.entries) {
				addArticleReference(articleIndex, normalizeRestaurantName(entry.name), {
					articleTitle: source.title,
					articleUrl: source.articleUrl,
					sourceName: source.sourceName,
					placeLink: entry.sourceLink,
					notes: entry.notes
				});
			}
		}
	}

	return articleIndex;
}

function buildConversationIndex() {
	const conversationIndex = new Map<string, RestaurantConversation[]>();

	for (const conversation of restaurantConversations as RestaurantConversation[]) {
		const key = normalizeRestaurantName(conversation.restaurantName);
		const existing = conversationIndex.get(key) ?? [];
		conversationIndex.set(key, [...existing, conversation]);
	}

	return conversationIndex;
}

function buildManualResearchIndex() {
	const researchIndex = new Map<string, ManualRestaurantResearch[]>();

	for (const entry of manualRestaurantResearch as ManualRestaurantResearch[]) {
		const key = normalizeRestaurantName(entry.restaurantName);
		const existing = researchIndex.get(key) ?? [];
		researchIndex.set(key, [...existing, entry]);
	}

	return researchIndex;
}

function applyConversationData(restaurant: WorkingRestaurant, conversations: RestaurantConversation[]) {
	for (const conversation of conversations) {
		for (const tag of conversation.researchTags) {
			restaurant.researchTags.add(tag);
		}

		restaurant.quotes.push({
			quote: conversation.responseQuote,
			sourceLabel: `Email from ${conversation.contactName} (${conversation.date})`
		});

		restaurant.notes.push(`Direct reply summary: ${conversation.summary}`);

		if (conversation.decision) {
			restaurant.notes.push(`Decision: ${conversation.decision}`);
		}

		if (conversation.website) {
			restaurant.resources.push({
				label: 'Official website',
				href: conversation.website,
				kind: 'website'
			});
		}

		if (conversation.address && restaurant.address.startsWith('Map pin only for now')) {
			restaurant.address = conversation.address;
		}

		if (conversation.phone && !restaurant.phone) {
			restaurant.phone = conversation.phone;
		}
	}
}

function findMatchingGoogleMapsDetail(
	name: string,
	latitude: number,
	longitude: number,
	details: GoogleMapsDetail[]
) {
	const normalizedName = normalizeRestaurantName(name);

	return details
		.filter((detail) => normalizeRestaurantName(detail.name) === normalizedName)
		.map((detail) => ({
			detail,
			distance: Math.abs(detail.latitude - latitude) + Math.abs(detail.longitude - longitude)
		}))
		.filter((candidate) => candidate.distance <= 0.01)
		.sort((left, right) => left.distance - right.distance)[0]?.detail;
}

function addArticleReference(
	index: Map<string, ArticleReference[]>,
	key: string,
	reference: ArticleReference
) {
	const existing = index.get(key) ?? [];
	index.set(key, [...existing, reference]);
}

function deriveTagsFromReferences(restaurant: WorkingRestaurant, references: ArticleReference[]) {
	const text = references
		.flatMap((reference) => [reference.quote ?? '', ...(reference.notes ?? [])])
		.join(' ')
		.toLowerCase();

	if (
		text.includes('100% nut free') ||
		text.includes(' nut free') ||
		text.includes('no peanut products') ||
		text.includes('do not have peanuts in their kitchen') ||
		text.includes('free from peanuts and tree nuts') ||
		text.includes('dedicated free from gluten + nuts')
	) {
		restaurant.researchTags.add('Nut free kitchen');
	}

	if (text.includes('highly accommodating')) {
		restaurant.researchTags.add('Can confidently accommodate');
	}

	if (text.includes('spokin verified')) {
		restaurant.researchTags.add('Spokin verified');
	}

	if (text.includes('nutrition guide') || text.includes('allergy faqs')) {
		restaurant.researchTags.add('Has allergen guide');
	}
}

function guessRestaurantType(name: string, references: ArticleReference[]) {
	const normalizedName = normalizeRestaurantName(name);
	const text = `${name} ${references.flatMap((reference) => reference.notes ?? []).join(' ')}`.toLowerCase();

	if (normalizedName === 'point-5') {
		return 'Unknown';
	}

	if (text.includes('gelato') || text.includes('ice cream')) {
		return 'Dessert';
	}

	if (text.includes('bagel') || text.includes('donut') || text.includes('bakery')) {
		return 'Bakery';
	}

	if (text.includes('cafe') || normalizedName === 'wheats-end') {
		return 'Cafe';
	}

	if (
		normalizedName.includes('chick-fil-a') ||
		normalizedName.includes('jimmy-john') ||
		normalizedName.includes('portillos')
	) {
		return 'Fast food';
	}

	if (
		normalizedName.includes('small-cheval') ||
		normalizedName.includes('seoul-taco') ||
		normalizedName.includes('tortazo') ||
		normalizedName.includes('bibibop') ||
		normalizedName.includes('fat-shallot') ||
		normalizedName.includes('epic-burger') ||
		normalizedName.includes('tilly-bagel')
	) {
		return 'Fast casual';
	}

	return 'Sit-down';
}

function guessCuisineSummary(name: string, type: RestaurantType) {
	const normalizedName = normalizeRestaurantName(name);

	if (normalizedName.includes('ramen-san')) {
		return 'Japanese ramen';
	}

	if (
		normalizedName.includes('lou-malnatis') ||
		normalizedName.includes('pizzeria-uno') ||
		normalizedName.includes('ginos-east') ||
		normalizedName.includes('paulie-gees')
	) {
		return 'Pizza';
	}

	if (normalizedName.includes('jeni') || normalizedName.includes('gelato')) {
		return 'Ice cream / gelato';
	}

	if (normalizedName.includes('bagel')) {
		return 'Bagel shop';
	}

	if (normalizedName.includes('donut')) {
		return 'Donuts and coffee';
	}

	if (normalizedName.includes('bibibop')) {
		return 'Korean rice bowls';
	}

	if (normalizedName.includes('seoul-taco')) {
		return 'Korean-Mexican tacos';
	}

	if (normalizedName.includes('chick-fil-a')) {
		return 'Chicken sandwiches';
	}

	if (normalizedName.includes('jimmy-john')) {
		return 'Sandwich shop';
	}

	if (normalizedName.includes('portillos')) {
		return 'Chicago beef, hot dogs, and fries';
	}

	if (normalizedName.includes('small-cheval') || normalizedName.includes('epic-burger')) {
		return 'Burgers and fries';
	}

	if (normalizedName.includes('steakhouse')) {
		return 'Steakhouse';
	}

	if (normalizedName.includes('daisies')) {
		return 'Pasta-forward American';
	}

	if (normalizedName.includes('ba-ba-reeba')) {
		return 'Spanish tapas';
	}

	if (normalizedName.includes('diner')) {
		return 'Vegan diner';
	}

	if (normalizedName.includes('fat-shallot')) {
		return 'Sandwiches';
	}

	if (normalizedName.includes('girl-and-the-goat')) {
		return 'New American small plates';
	}

	if (normalizedName.includes('cindys')) {
		return 'American rooftop dining';
	}

	if (normalizedName.includes('tortazo')) {
		return 'Mexican sandwiches and quick bites';
	}

	return defaultCuisineSummaryByType(type);
}

function guessMeals(name: string, type: RestaurantType): MealService[] {
	const normalizedName = normalizeRestaurantName(name);

	if (
		normalizedName.includes('bagel') ||
		normalizedName.includes('donut') ||
		normalizedName.includes('bakery') ||
		normalizedName.includes('wheats-end')
	) {
		return type === 'Bakery' ? ['Breakfast', 'Lunch', 'Dessert'] : ['Breakfast', 'Lunch'];
	}

	if (type === 'Dessert') {
		return ['Dessert'];
	}

	if (type === 'Fast food' || type === 'Fast casual' || type === 'Unknown') {
		return ['Lunch', 'Dinner'];
	}

	if (type === 'Cafe') {
		return ['Breakfast', 'Lunch'];
	}

	if (type === 'Bakery') {
		return ['Breakfast', 'Lunch', 'Dessert'];
	}

	return ['Lunch', 'Dinner'];
}

function buildApproximateAddress(latitude: number, longitude: number) {
	return `Map pin only for now (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
}

function guessNeighborhood(name: string, latitude: number, longitude: number) {
	const lowerName = name.toLowerCase();

	if (lowerName.includes('fulton market')) {
		return 'Fulton Market';
	}

	if (lowerName.includes('old town')) {
		return 'Old Town';
	}

	if (lowerName.includes('lincoln park')) {
		return 'Lincoln Park';
	}

	if (lowerName.includes('wicker park')) {
		return 'Wicker Park';
	}

	if (lowerName.includes('gold coast')) {
		return 'Gold Coast';
	}

	if (lowerName.includes('south loop')) {
		return 'South Loop';
	}

	if (lowerName.includes('willis tower') || lowerName.includes('sterling food hall')) {
		return 'Loop';
	}

	if (lowerName.includes('canal and taylor')) {
		return 'West Loop';
	}

	if (lowerName.includes('addison')) {
		return 'North Side';
	}

	if (latitude < 41.82 || latitude > 42.02 || longitude < -87.9) {
		return 'Outside Chicago';
	}

	if (latitude >= 41.938 && longitude > -87.69 && longitude <= -87.64) {
		return 'Lakeview';
	}

	if (latitude >= 41.915 && latitude < 41.938 && longitude > -87.66 && longitude <= -87.63) {
		return 'Lincoln Park';
	}

	if (latitude >= 41.919 && longitude <= -87.69) {
		return 'Logan Square';
	}

	if (latitude >= 41.904 && latitude < 41.918 && longitude <= -87.66) {
		return 'Wicker Park';
	}

	if (latitude >= 41.898 && latitude < 41.915 && longitude > -87.645 && longitude <= -87.625) {
		return 'Gold Coast';
	}

	if (latitude >= 41.888 && latitude < 41.898 && longitude > -87.64 && longitude <= -87.62) {
		return 'River North';
	}

	if (latitude >= 41.881 && latitude < 41.889 && longitude > -87.668 && longitude <= -87.641) {
		return 'West Loop';
	}

	if (latitude >= 41.875 && latitude < 41.889 && longitude > -87.641 && longitude <= -87.623) {
		return 'Loop';
	}

	if (latitude >= 41.868 && latitude < 41.875 && longitude > -87.641 && longitude <= -87.623) {
		return 'South Loop';
	}

	if (latitude >= 41.89 && latitude < 41.904 && longitude <= -87.62) {
		return 'Streeterville';
	}

	if (latitude >= 41.84 && latitude < 41.868) {
		return 'South Side';
	}

	return 'Chicago area';
}

function defaultCuisineSummaryByType(type: RestaurantType) {
	switch (type) {
		case 'Bakery':
			return 'Bakery / pastry stop';
		case 'Cafe':
			return 'Cafe / brunch spot';
		case 'Dessert':
			return 'Dessert stop';
		case 'Fast casual':
			return 'Fast-casual counter service';
		case 'Fast food':
			return 'Quick-service chain';
		case 'Unknown':
			return 'Restaurant still being categorized';
		default:
			return 'Sit-down restaurant';
	}
}

function guessResourceKind(href: string): ResourceKind {
	if (href.includes('allergen') || href.includes('nutrition') || href.includes('faq')) {
		return 'allergen';
	}

	return 'website';
}

function normalizeRestaurantName(name: string) {
	const cleaned = cleanRestaurantName(name)
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/&/g, ' and ')
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return NORMALIZED_NAME_ALIASES[cleaned] ?? cleaned;
}

function cleanRestaurantName(name: string) {
	return name.replace(/\s+/g, ' ').trim();
}

function buildLocationKey(name: string, latitude: number, longitude: number) {
	return `${normalizeRestaurantName(name)}:${latitude.toFixed(5)}:${longitude.toFixed(5)}`;
}


function buildSlug(canonicalKey: string, latitude: number, longitude: number) {
	const latitudePart = latitude.toFixed(4).replace('.', '-');
	const longitudePart = Math.abs(longitude).toFixed(4).replace('.', '-');

	return `${canonicalKey}-${latitudePart}-w${longitudePart}`;
}

function shouldExcludeLocation(canonicalKey: string, latitude: number, longitude: number) {
	return (
		canonicalKey === 'point-5' ||
		canonicalKey === 'bibibop-asian-grill' &&
		(latitude < 41.85 || latitude > 41.95 || longitude < -87.8)
	);
}

function stripWrappingQuotes(value: string) {
	return value.replace(/^[“"]+/, '').replace(/[”"]+$/, '').trim();
}

function isWebsiteLink(href: string) {
	return href.startsWith('http://') || href.startsWith('https://');
}

function shouldAddPlaceLinkResource(href: string) {
	if (!isWebsiteLink(href)) {
		return false;
	}

	try {
		const url = new URL(href);
		return !url.hostname.endsWith('app.link');
	} catch {
		return false;
	}
}

function normalizeHref(href: string) {
	try {
		const url = new URL(href);
		return `${url.origin}${url.pathname}`.replace(/\/$/, '');
	} catch {
		return href.replace(/\/$/, '');
	}
}

function scoreResource(resource: ResourceLink) {
	const kindScore =
		resource.kind === 'website'
			? 5
			: resource.kind === 'menu'
				? 4
				: resource.kind === 'allergen'
					? 3
					: resource.kind === 'reservation'
						? 2
						: 1;

	const labelScore = resource.label === 'Official website' ? 5 : 0;
	const pathScore = resource.kind === 'website' ? scorePathSpecificity(resource.href) : 0;

	return kindScore * 100 + labelScore * 10 + pathScore;
}

function scrubWebsiteResources(resources: ResourceLink[]) {
	const chosenByHost = new Map<string, ResourceLink>();
	const nonWebsiteResources: ResourceLink[] = [];

	for (const resource of resources) {
		if (resource.kind !== 'website') {
			nonWebsiteResources.push(resource);
			continue;
		}

		const host = normalizeHostname(resource.href);

		if (!host) {
			nonWebsiteResources.push(resource);
			continue;
		}

		const existing = chosenByHost.get(host);

		if (!existing || scoreResource(resource) > scoreResource(existing)) {
			chosenByHost.set(host, resource);
		}
	}

	return [...chosenByHost.values(), ...nonWebsiteResources];
}

function normalizeHostname(href: string) {
	try {
		const url = new URL(href);
		return url.hostname.replace(/^www\./, '');
	} catch {
		return null;
	}
}

function scorePathSpecificity(href: string) {
	try {
		const url = new URL(href);
		const segments = url.pathname.split('/').filter(Boolean);
		return segments.length * 10 + url.pathname.length;
	} catch {
		return 0;
	}
}

function dedupeResources(resources: ResourceLink[]) {
	const byHref = new Map<string, ResourceLink>();

	for (const resource of resources) {
		const key = normalizeHref(resource.href);
		const existing = byHref.get(key);

		if (!existing || scoreResource(resource) > scoreResource(existing)) {
			byHref.set(key, resource);
		}
	}

	return scrubWebsiteResources([...byHref.values()]);
}

function dedupeQuotes(quotes: SourceQuote[]) {
	const seen = new Set<string>();

	return quotes.filter((quote) => {
		const key = `${quote.sourceLabel}:${quote.quote}`;

		if (seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
}

function dedupeStrings(values: string[]) {
	return [...new Set(values)];
}

function removeQuotedResources(resources: ResourceLink[], quotes: SourceQuote[]) {
	const quotedHrefs = new Set(
		quotes.map((quote) => quote.href).filter((href): href is string => typeof href === 'string').map(normalizeHref)
	);

	return resources.filter((resource) => !quotedHrefs.has(normalizeHref(resource.href)));
}

function compareCoordinates(
	leftLatitude: number,
	leftLongitude: number,
	rightLatitude: number,
	rightLongitude: number
) {
	if (leftLatitude !== rightLatitude) {
		return leftLatitude - rightLatitude;
	}

	return leftLongitude - rightLongitude;
}

function compareText(left: string, right: string) {
	return left.localeCompare(right);
}

function compareResearchTags(left: ResearchTag, right: ResearchTag) {
	const leftIndex = RESEARCH_TAGS.indexOf(left);
	const rightIndex = RESEARCH_TAGS.indexOf(right);

	if (leftIndex !== rightIndex) {
		return leftIndex - rightIndex;
	}

	return compareText(left, right);
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
	const grouped = new Map<string, T[]>();

	for (const item of items) {
		const key = getKey(item);
		const existing = grouped.get(key) ?? [];
		grouped.set(key, [...existing, item]);
	}

	return grouped;
}
