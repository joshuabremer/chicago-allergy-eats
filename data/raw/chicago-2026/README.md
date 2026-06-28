# Chicago 2026 raw import

This folder is the repo-backed home for the raw source material imported from:

`/Users/jbremer/Downloads/Chicago 2026 (1)`

## Layout

- `geojson/` — copied GeoJSON files with normalized kebab-case filenames
- `catalog.json` — machine-readable index with original filenames, stored filenames, and feature counts
- `google-maps-details.json` — pasted Google Maps details with addresses, websites, phones, ratings, and coordinates for restaurant locations
- `restaurant-conversations.json` — structured restaurant email replies, summaries, decisions, and any manual add-to-list metadata
- `manual-restaurant-research.json` — manually added menus, allergy links, review links, quotes, and tag-worthy notes that should be synthesized into restaurant pages
- `restaurant-decisions.json` — repo-backed default decision states and notes for places you already know are approved or rejected

## Imported files

| Title | Features | Stored file |
| --- | ---: | --- |
| Dinner Reservations | 1 | `geojson/dinner-reservations.geojson` |
| Restaurants that are Probably OK | 2 | `geojson/restaurants-that-are-probably-ok.geojson` |
| Restaurants that can Accommodate | 29 | `geojson/restaurants-that-can-accommodate.geojson` |
| Restaurants to Verify | 17 | `geojson/restaurants-to-verify.geojson` |
| Tree Nut Free Restaurants | 10 | `geojson/tree-nut-free-restaurants.geojson` |
| US Watch Parties | 4 | `geojson/us-watch-parties.geojson` |

Future prompts can reference this folder directly, and new raw dumps can be added alongside it or merged into these files later.
