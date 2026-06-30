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
- `beatrix-river-north-menus.json` — user-pasted raw Beatrix River North menu capture used for source-linked quotes and analysis
- `big-star-wicker-park-menu.json` — user-pasted Big Star Wicker Park menu capture
- `doves-luncheonette-menu.json` — user-pasted Dove's Luncheonette menu capture
- `parlor-pizza-menu.json` — user-pasted Parlor Pizza menu capture
- `pizzeria-uno-and-due-menus.json` — user-pasted Uno takeout menu, Uno site menu, Due menu, and phone-call allergy notes
- `pizanos-chicago-loop-menu.json` — user-pasted Pizano's Chicago Loop menu capture plus allergen notes
- `pizanos-state-street-menu.json` — user-pasted Pizano's State Street menu capture plus comparison notes against the Loop page
- `reddit-chicagofood-food-allergy-thread.json` — user-supplied takeaway and source URL for a Reddit allergy discussion that needs manual follow-up if exact quotes are needed
- `reddit-foodallergies-chicago-trip-with-food-allergies.json` — Reddit travel thread URL plus clearly labeled search-layer synthesis because direct Reddit fetch was blocked
- `reddit-peanutallergy-traveling-to-chicago-this-summer.json` — Reddit peanut-allergy Chicago travel thread preserved as a blocked-fetch lead with secondary synthesis
- `reddit-chicago-suburbs-allergy-friendly-restaurants.json` — Chicago suburbs Reddit lead preserved with blocked-fetch status and search-layer notes
- `reddit-askchicago-dining-with-food-allergies.json` — AskChicago Reddit lead preserved with blocked-fetch status and search-layer notes
- `lettuce-entertain-you-chicagoland-list.json` — user-pasted Chicago subset of the Lettuce Entertain You restaurant list PDF
- `kid-cultivation-allergy-friendly-restaurants.json` — captured quote about Lettuce Entertain You allergy protocols from an allergy-focused restaurant roundup
- `lettuce-contact-dietary-restrictions.json` — user-pasted official Lettuce Entertain You accommodations language from the contact FAQ
- `nut-free-new-york-chicago-trip.json` — captured allergen-related excerpts from a Chicago restaurant roundup on Nut Free New York
- `summer-house-santa-monica-menus.json` — user-pasted Summer House Santa Monica menus with a note that only almond mentions were explicit in the pasted sections
- `aba-menus.json` — user-pasted Aba menus with explicit pistachio, cashew, walnut, and hazelnut callouts
- `ema-menus.json` — user-pasted Ema menus with explicit pine nut, pistachio, and coconut callouts
- `ramen-san-menus.json` — user-pasted Ramen-San menus noting no explicit tree nuts or peanuts in the pasted sections
- `restaurant-outreach-sent.json` — user-sent outreach emails to restaurants that have not yet replied

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
