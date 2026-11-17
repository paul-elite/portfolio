# Designing Search: rehearsal notes

**Gold copied:** `examples/wikipedia` (search suggestions refining in place, a pick that navigates, a caused reset). Framing from `examples/static-card` (feature card, pinned bottom bleed, 400 × 300; compact 358 × 300).

**Story (about 14s loop):** click into the store's search → type "lounge" → suggestions drop, each ending in what it does ("Search" runs a query, "Open" goes to a product) → type "ch", the rows refine top to bottom → pick "Lounge chair, oak" → the page becomes the chair (payoff holds about 2.6s) → the field's clear button resets it to the collection.

**Poster:** "lounge ch" with the refined suggestions open, the story in one frame.

**Changed from the gold:** a store instead of Wikipedia, warm greys, standard fidelity (real words only on the query, the three suggestions, their actions and the product), material swatches in place of photos, a product page instead of an article, clear button instead of the browser's back.

**Checked:** filmed with `scripts/film.mjs --gate` at 400 and at 390 (compact); both end `rehearsal passed`. Remaining lines are `vanishes with no exit` on `ss-swap__in`, which the wikipedia gold reports identically (the kit's `Swap` handoff). Placeholder exit fixed (80ms fade); the row reset moved into the product hold so nothing resets at the clear. Checked live on `/cards` at 1200 wide.

**Not checked:** dark theme (the site is light only); hover-to-play (it loops); Safari.

**On the site:** the kit is vendored in `components/stageshow/kit` (MIT, benjitaylor/skills). The site copy makes the stage transparent so the feature card draws the surface; the source of truth for the scene is `.agents/skills/stageshow/examples/designing-search`.
