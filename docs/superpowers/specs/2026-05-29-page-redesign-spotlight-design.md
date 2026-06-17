# Page Redesign — "Spotlight"

**Date:** 2026-05-29
**Status:** Approved (design), pending implementation plan

## Goal

Revamp the personal portfolio so the first impression is dramatically more
striking, while keeping the existing color identity, the Libre Baskerville
serif font, and all current content and functionality. The page should read
like a dark stage with the owner's name under a purple spotlight — bold,
editorial, and intentional rather than flashy for its own sake.

## Decisions (from brainstorming)

- **Scope:** Full-page redesign (hero + Education, Experience, Projects,
  Contact, and the card system), unified under one design language.
- **Aesthetic:** Dramatic dark + glow.
- **Motion:** High-impact, choreographed entrance on first load.
- **Theme:** Dark-first (default on load); light mode kept and polished as the
  secondary toggle experience.
- **Hero centerpiece:** Oversized glowing name — type as the art.

## Design Tokens (Foundation)

- **Default theme = dark.** `ThemeProvider` defaults to dark when no stored
  preference exists. Light mode remains fully available via the existing
  toggle.
- **Palette (unchanged hues):**
  - Canvas: near-black (`neutral-950` / `#0a0a0c`).
  - Accent glow: `#8900e1` (highlight), `#57078c` (`--color-nyu`, deep).
  - Body text: existing neutral grays.
  - No new colors introduced.
- **Font (unchanged):** Libre Baskerville serif throughout; leaned into harder
  as the primary design statement.
- New shared CSS tokens/utilities for the purple text-glow and radial bloom
  live in `src/index.css`.

## Hero — the Showpiece

File: `src/components/Hero.jsx` (+ background work in `PageBackground.jsx`).

- **Oversized name:** "Jason Liu" rendered massive via responsive
  `clamp()` (up to ~`11rem`), tight letter-tracking, dominating the first
  viewport. Keep `text-neutral-900` in light mode / `white` in dark with a
  subtle purple neon text-glow in dark mode.
- **Purple bloom:** a soft radial aurora glow sits behind the name.
- **Cursor-reactive spotlight:** the bloom gently follows the mouse (parallax).
  - Disabled (static) on touch devices and when
    `prefers-reduced-motion: reduce` is set.
- **Choreographed entrance** (on load):
  1. Glow blooms in.
  2. Name rises word-by-word (staggered).
  3. Eyebrow kicker ("CS @ NYU · Full-Stack Developer", with a small
     "available" status dot) and the existing intro paragraph fade up beneath.
- **Holiday typewriter** (`HolidayTypeWriter`) is preserved.
- A quiet scroll cue at the bottom of the hero.

## Section System (Cohesion)

File: `src/components/SectionHero.jsx` and the section components.

- **Numbered, oversized section headers:** e.g. `01 — Education`,
  `02 — Experience`, `03 — Projects`, `04 — Contact`, with a thin purple
  accent rule. Implemented in `SectionHero` so all sections share it.
- **Dark glass cards:** keep the existing `.card` glow-on-hover, made more
  consistent and pronounced across `EducationCard`, `ExperienceCard`,
  `ProjectCard`.
- **Reveal-on-scroll:** each section animates up as it enters the viewport,
  reusing the existing `framer-motion` variants in
  `src/constants/variants.js`.

## Background

File: `src/components/PageBackground.jsx`.

- **Dark mode:** layered radial purple glows + a very faint grain/noise (and
  optional subtle grid) so the black has depth instead of reading flat.
- **Light mode:** stays clean white with purple accents (current behavior,
  lightly polished).

## Scope

**Touches:**
- `src/components/Hero.jsx` — oversized glowing name, choreographed entrance,
  cursor-reactive spotlight.
- `src/components/PageBackground.jsx` — layered dark glows + grain.
- `src/components/SectionHero.jsx` — numbered oversized section headers.
- `src/index.css` — glow/bloom tokens and utilities.
- `src/components/ThemeProvider.jsx` — dark as default.
- Styling pass on `Education`, `Experience`, `Projects`, `Contact`, and the
  card components for consistency.

**Keeps (no functional change):**
- All content and copy.
- Holiday typewriter, navbar behavior, tech slider.
- Light/dark toggle, routing, admin page, analytics.

## Non-Goals

- No content rewrites, no new sections, no backend changes.
- No new color palette or font.
- No removal of light mode.

## Success Criteria

- On first load (dark), the hero produces a clear "wow": oversized glowing name
  with a choreographed entrance and a cursor-reactive spotlight.
- The whole page feels cohesive (numbered headers, consistent glass cards,
  scroll reveals) and bold/professional.
- Light mode remains polished and fully functional via the toggle.
- `prefers-reduced-motion` and touch devices degrade gracefully.
- No regression to existing functionality (navbar, typewriter, tech slider,
  admin, analytics, routing).
- `npm run build` succeeds.
