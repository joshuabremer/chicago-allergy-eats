# Chicago Allergy Eats Copilot Instructions

## Project workflow

- Treat this repository as the source of truth for ongoing restaurant research.
- Keep raw source materials in the repo so future prompts can find and reuse them.
- Use `data/raw/` for imported source files such as GeoJSON exports, article captures, pasted menus, PDFs, and other research artifacts.
- Prefer preserving imported source material in a structured, referenceable form even before it is curated into the app.
- When the conversation establishes a durable repository rule, taxonomy, or workflow, update this file so future prompts inherit it.

## Curation rules

- Do not add new restaurants to the curated in-app restaurant list unless the user explicitly asks.
- The user does not want the main list overwhelmed while early research is still being organized.
- Keep curated app data focused and intentional; use raw data files for everything else until promotion is requested.

## Data organization

- `src/lib/data/restaurants.ts` is the curated restaurant list shown in the app.
- `src/lib/data/research-dump.ts` is the inbox for raw notes, links, quotes, PDFs, and ideas that are already distilled enough to show in-app.
- `data/raw/chicago-2026/` stores larger imported source datasets and article captures.
- `data/raw/chicago-2026/manual-restaurant-research.json` stores manually added menus, review links, menu notes, and small synthesized research add-ons.
- `data/raw/chicago-2026/restaurant-decisions.json` stores repo-backed default approved/rejected decisions and rejection notes.
- When adding new source material, favor searchable structured files such as JSON, GeoJSON, or clearly organized markdown/text exports.

## Source collection

- When a site or menu is difficult to scrape or fetch cleanly, ask the user to paste the content instead of getting stuck.
- If the user pastes content, structure it into the repo so later prompts can quote it, link it, and curate it.
- If the user pastes a restaurant menu, save it as a raw repo-backed source file and synthesize it into menu links, pull quotes, and menu analysis instead of leaving it only in chat.
- As new research comes in, preserve the raw source in the repo, include source links and quotes on the restaurant detail page, add analysis, and always reference the source.

## Product expectations

- The homepage should be a searchable restaurant list with filters and a map, not grouped by neighborhood.
- The homepage should default to hiding rejected restaurants by preselecting `ready-to-review`, `needs-more-info`, and `approved`.
- The detail page should support rich review with quick read, research tags, quotes, menu links, and menu-specific red/green flag notes.
- User approvals, statuses, comments, and personal tags are stored in the JSON-backed review backend.

## Decision state model

- Restaurant decision state is separate from research tags and uses the explicit states `ready-to-review`, `needs-more-info`, `awaiting-restaurant-response`, `approved`, and `rejected`.
- Use `ready-to-review` for places that are ready to hand off for review now.
- Use `needs-more-info` for places that should stay in circulation until more research or follow-up is added.
- Use `awaiting-restaurant-response` when the next step is waiting on outreach rather than doing more internal research first.
- `rejected` must never appear as a research tag; it belongs only in the decision-state system.
- Rejection reasons should be preserved when the user supplies them.

## Research tag taxonomy

- Keep `Nut free menu` distinct from `Nut free kitchen`.
- Use `Can accommodate` when a restaurant says it can handle the allergy, but leave the confidence judgment to the user.
- Use `Got email response` when the restaurant has replied directly to outreach.
- Use `Reached out` when the user has sent a message to the restaurant and is waiting on a reply.
- Keep `Has allergy guide` distinct from `Has allergy labels`.
- Use `Has allergy guide` for full allergen or nutrition guides such as BIBIBOP.
- Use `Has allergy labels` for menus that visibly label allergens without providing a full guide.
- For this project, do not treat peanuts or almonds as allergy red flags.

## Detail page interaction

- Research tags on the detail page can be dismissed with an `x`, and that dismissal should stay browser-local instead of rewriting curated source data.
- Do not show a long freeform Notes section on the detail page.

## Menu and analysis conventions

- Menu links should live in the main `Links` section alongside other resources.
- If there is curated menu analysis, show it in a separate `Menu analysis` section instead of attaching it directly under the link.
- Menu analysis should be menu-specific, not mixed with general review evidence.
- For menu analysis notes, use simple line items with `✅` for green flags, `⚠️` for yellow flags, and `🚩` for red flags.

## Link and source handling

- If a source already appears as a pull quote with the same URL, do not duplicate it in the general links section.
- Prefer more specific or more useful restaurant links over redundant homepage links on the same host.
