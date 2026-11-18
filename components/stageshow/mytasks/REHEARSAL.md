# Designing Search card: rehearsal notes

**Source:** Paul's Figma, portfolio file, page "Feature cards": Frame 22 (1643:96) is the opening, Frame 26 (1647:313) the payoff. Sizes, colors, radii, shadows and type are taken from Frame 22; the SVGs (star, filled star, avatar, status dot, delete, skeleton lead) are Figma's own exports, inlined in `assets.ts`.

**Story (about 12s loop):** the page is starred (star fills, the view becomes "Tasks") → the first task's status is clicked from Done to Paid → payoff holds → the same two clicks put it back, so the reset has a cause.

**Poster:** the Frame 26 state (starred, Tasks, Paid).

**Checked:** filmed with `scripts/film.mjs --gate` in the Stageshow preview; on the site at 1280 (project page, 552 × 305) and in the /cards grid. Remaining gate lines: `uneven padding` on the window, which is the design's own geometry (kept on purpose), and `vanishes with no exit` on `ss-swap__in`, which the kit's gold examples report identically.

**Not checked:** phone width (the 552 design scales down; there is no compact version yet), Safari.

**Source of truth for the scene:** `.agents/skills/stageshow/examples/mytasks`; the site copy adds `'use client'` and imports `../kit`.
