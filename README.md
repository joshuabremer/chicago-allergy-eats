# Chicago Allergy Eats

A SvelteKit site for researching Chicago restaurants, comparing allergy-related evidence, and saving review decisions to a JSON-backed server store.

## What is in the app

- Neighborhood-grouped restaurant list
- Filters for restaurant type, research tags, and approved-only view
- Map view with clickable markers
- Detail panel with notes, quotes, links, and research dump items
- JSON-backed approvals, comments, and personal tags for "want to try" style promotion

## Where to keep adding information

There are two repo-backed data files:

1. `src/lib/data/restaurants.ts` — curated cards that appear in the main list
2. `src/lib/data/research-dump.ts` — raw research inbox for links, menu PDFs, allergen docs, ideas, quotes, and scraps of notes

There is also a raw source-material area for larger imports:

3. `data/raw/chicago-2026/` — copied source files such as GeoJSON exports, plus a `catalog.json` index

The intended workflow is:

1. Dump raw findings into `research-dump.ts`
2. Later promote the good parts into `restaurants.ts`
3. Use the app UI to browse, filter, and approve/promote places

## Review state storage

Review decisions, comments, and hidden tags are stored in:

1. `data/user-reviews.json` — the server-backed JSON store used by the app at runtime

That means in future prompts you can send me rough notes like:

```text
Add this to the research dump:
- Restaurant: Example Logan Square Dinner Spot
- Type: allergen
- Link: https://...
- Notes: They emailed that desserts are made off-site.
```

and I can append it into the repo for you.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run check
npm run build
```
