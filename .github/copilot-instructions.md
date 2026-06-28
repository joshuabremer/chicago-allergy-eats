# Chicago Allergy Eats Copilot Instructions

## Project workflow

- Treat this repository as the source of truth for ongoing restaurant research.
- Keep raw source materials in the repo so future prompts can find and reuse them.
- Use `data/raw/` for imported source files such as GeoJSON exports, article captures, pasted menus, PDFs, and other research artifacts.
- Prefer preserving imported source material in a structured, referenceable form even before it is curated into the app.

## Curation rules

- Do not add new restaurants to the curated in-app restaurant list unless the user explicitly asks.
- The user does not want the main list overwhelmed while early research is still being organized.
- Keep curated app data focused and intentional; use raw data files for everything else until promotion is requested.

## Data organization

- `src/lib/data/restaurants.ts` is the curated restaurant list shown in the app.
- `src/lib/data/research-dump.ts` is the inbox for raw notes, links, quotes, PDFs, and ideas that are already distilled enough to show in-app.
- `data/raw/chicago-2026/` stores larger imported source datasets and article captures.
- When adding new source material, favor searchable structured files such as JSON, GeoJSON, or clearly organized markdown/text exports.

## Source collection

- When a site or menu is difficult to scrape or fetch cleanly, ask the user to paste the content instead of getting stuck.
- If the user pastes content, structure it into the repo so later prompts can quote it, link it, and curate it.

## Product expectations

- The app should support a simple neighborhood-first browsing flow with rich detail views, links, quotes, and allergen resources.
- User approvals and promotion tags are browser-local unless the user asks for a shared backend.
