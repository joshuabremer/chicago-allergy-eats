import type { ResearchDumpEntry } from '$lib/types';

export const researchDump: ResearchDumpEntry[] = [
	{
		id: 'geojson-import',
		title: 'Chicago 2026 restaurant map import',
		kind: 'note',
		excerpt:
			'Imported GeoJSON restaurant source lists now live under data/raw/chicago-2026/geojson and power the in-app restaurant list.',
		capturedAt: '2026-06-28',
		status: 'curated'
	},
	{
		id: 'spokin-favorites-import',
		title: 'Spokin favorites article imported',
		kind: 'review',
		excerpt:
			'Pull quotes and source links from Alyssa’s Favorite Nut-Friendly Chicago Spots were captured into structured raw article data.',
		href: 'https://www.spokin.com/alyssas-favorite-nut-free-chicago-spots',
		capturedAt: '2026-06-28',
		status: 'curated'
	},
	{
		id: 'spokin-itinerary-import',
		title: 'Spokin itinerary article imported',
		kind: 'review',
		excerpt:
			'The Chicago travel itinerary article was captured as structured source data so matched restaurants can show linked quotes.',
		href: 'https://www.spokin.com/chicago-illinois-travel-itinerary-nut-milk-egg-shellfish-wheat-free',
		capturedAt: '2026-06-28',
		status: 'curated'
	},
	{
		id: 'allthings-guide-import',
		title: 'All Things Allergies guide imported',
		kind: 'review',
		excerpt:
			'The Chicago allergy-friendly restaurant guide was captured as structured source data with official links and notes where available.',
		href: 'http://allthingsallergies.com/2020/06/28/chicago-allergy-friendly-restaurant-guide/',
		capturedAt: '2026-06-28',
		status: 'curated'
	},
	{
		id: 'future-prompt-bucket',
		title: 'Future prompt bucket',
		kind: 'note',
		excerpt:
			'In future prompts, you can send raw notes, PDFs, links, screenshots, and half-formed ideas. I can keep appending them here and then promote them into the curated cards.',
		capturedAt: '2026-06-28',
		status: 'inbox'
	}
];
