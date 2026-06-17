# Portfolio UI Revamp — Design Spec

**Date:** 2026-06-17
**Status:** Approved (design phase)
**Branch:** v2

## Goal

Revamp the portfolio page to be more creative and distinctive (a "Glass / Neon
Depth" direction) while keeping it authentic and non-generic. The headline change
is a screenshot-forward Projects section. The revamp is a cohesive whole-page
pass: every section adopts a shared glass visual language driven by a single,
centralized color system.

## Hard constraints (guardrails)

- **Navbar is not touched** — leave `Navbar.jsx` and its behavior exactly as-is.
- **No copy/text changes** anywhere on the page. The only data change is adding a
  `screenshot` field (image filename) to project entries — not visible copy.
- Light and dark modes both supported; contrast preserved.
- `prefers-reduced-motion` and touch/coarse-pointer devices handled gracefully.

## Chosen direction

**C — Glass / Neon Depth, cursor-driven.** Frosted glass cards floating over a
dark/light background. The signature interaction: a **cursor-following spotlight**
that lights up the *background* (not the cards). Cards themselves never glow.

---

## 1. Centralized color system (single knob)

This project uses **Tailwind v4**, which has **no `tailwind.config.js`**. The theme
source of truth is the `@theme` block in `src/index.css` (already contains
`--color-nyu`).

Define a small set of **semantic accent tokens** in that block:

- `--color-accent` — primary brand color, seeded with `#57078c` (NYU purple).
- `--color-accent-strong` — brighter accent, seeded with `#8900e1`.

All accent-colored UI derives from these via `color-mix()` (for tints, alphas,
glows) rather than hardcoded purples:

- cursor spotlight glow
- tech chips / pills
- hover borders on glass cards
- section index labels (01·02·03) and the hairline rule
- link hover color

**Success criterion:** changing `--color-accent` (and optionally
`--color-accent-strong`) in `src/index.css` recolors the entire page, spotlight
included, with no other edits.

Glass *surfaces* stay neutral (white/black alpha) so they read correctly against
any accent.

**Migration note:** existing hardcoded purples (`#280D3D`, `#8900e1`, `#57078c`,
`bg-purple-100`, `text-purple-900`, `dark:bg-[#280D3D]`, the `--shadow-*` purple
tokens, etc.) in components and `index.css` are replaced with references to the
new tokens during the implementation pass.

## 2. Cursor spotlight (background)

Replaces the current auto-drifting background blobs in `PageBackground.jsx`.

- A single fixed, full-viewport layer with a radial-gradient whose center is
  positioned via CSS custom properties `--mx` / `--my`.
- Position updated on `pointermove` (passive listener) and applied inside a
  `requestAnimationFrame` callback so we write to the DOM at most once per frame.
- **Dark mode:** strong accent glow (derived from `--color-accent` /
  `--color-accent-strong`).
- **Light mode:** same follow behavior, much fainter/gentler tint.
- The dark-mode grain overlay is retained.

**Fallbacks:**

- `prefers-reduced-motion: reduce` **or** coarse pointer / no hover (touch):
  do not attach the move listener; render a soft static centered glow instead.

**Component shape:** `PageBackground.jsx` keeps responsibility for the background.
A small hook (e.g. `useCursorSpotlight`) encapsulates the pointer tracking + rAF +
reduced-motion/touch detection and exposes the CSS vars. Keeps the component thin
and the behavior independently testable.

## 3. Glass card style (shared)

A single shared treatment used by Education, Experience, Projects, and Contact —
implemented by evolving the existing `.card` utility in `src/index.css`:

- Surface: `bg-white/60` (light) / `bg-white/5` (dark), `backdrop-blur`.
- Hairline border; radius consistent across the site.
- Hover: subtle **lift (translateY)** + **border-brighten** (accent-tinted) only.
  **No glow** — remove `dark:hover:shadow-glow-purple` from `.card`.

## 4. Projects — rebuild

The headline change. From small-logo-beside-text rows to a screenshot-forward
grid.

**Layout**

- Keep the existing `SectionHero` header (`03 / Projects / Having Fun`).
- Below it, a **single-column stack** of screenshot-forward glass project cards
  (one card per row, constrained to a comfortable reading width). This replaces
  the current `1/4 + 3/4` row layout for this section. Multi-column grid is
  deferred — the card is built so a grid can be added later without rework.

**Card anatomy (`ProjectCard.jsx`)**

1. Screenshot, top, **16:10**, `object-cover`, lazy-loaded, subtle zoom on hover.
2. Title (`title`).
3. Description (`desc`) — unchanged text.
4. Tech chips (`technologies`) as glass pills (accent-tinted).
5. Live / GitHub icon links — **existing ReactGA event tracking preserved**
   (`live_link_click`, `github_link_click`).

**Screenshots & data**

- New `screenshot` field on each entry in `PROJECTS` (`src/constants/const.js`),
  pointing at a file in `src/assets/projects/`.
- User supplies the screenshots. **Recommended:** 16:10, ~1600×1000px, compressed
  (webp/png).
- **Graceful fallback:** if `screenshot` is absent/missing, render the existing
  `image` (logo) centered on a tinted glass panel sized to the same 16:10 box, so
  the grid never breaks before all screenshots are added.

## 5. Other sections (cohesive pass, no copy changes)

- **Hero:** same text; refined heading typography; spotlight reads behind it.
- **Education / Experience:** existing cards adopt the shared glass treatment;
  consistent spacing and hover motion.
- **Technologies / TechSlider:** keep the marquee; restyle tech items as glass
  pills consistent with project chips.
- **Contact:** form fields + submit button → glass styling, accent-driven focus.
- **Footer:** minor consistency polish.

**Cohesion guarantee:** project cards consume the same glass tokens, spacing
scale, hover motion, radius, blur, border weight, and accent tokens as the rest of
the page.

## 6. Typography

- Actually load **Libre Baskerville** as a real webfont via
  `@fontsource/libre-baskerville` (currently declared in CSS but never loaded, so
  the page falls back to system fonts).
- **Libre Baskerville** for display headings; **Inter** (already a dependency,
  `@fontsource-variable/inter`) for body/description text for legibility in the
  denser glass UI.
- Mono index labels (01·02·03) retained.

## 7. Affected files (anticipated)

- `src/index.css` — accent tokens in `@theme`, glass `.card` evolution, font wiring.
- `src/components/PageBackground.jsx` — cursor spotlight (+ new spotlight hook).
- `src/components/Projects.jsx` — grid layout.
- `src/components/ProjectCard.jsx` — screenshot-forward glass card + fallback.
- `src/constants/const.js` — `screenshot` field on `PROJECTS`.
- `src/components/Education*.jsx`, `Experience*.jsx`, `Technologies.jsx`,
  `TechSlider.jsx`, `Contact.jsx`, `Footer.jsx`, `Hero.jsx` — glass/token pass.
- `src/main.jsx` (or entry) — font imports.
- **Not touched:** `Navbar.jsx`.

## 8. Verification / success criteria

- Cursor spotlight follows the pointer in both modes; static glow under
  reduced-motion and on touch; no jank (rAF-throttled).
- Editing `--color-accent` in `src/index.css` recolors spotlight, chips, borders,
  index labels, and link hovers across the whole page.
- Projects render as a single-column stack of glass cards; screenshots show when
  present, logo fallback when absent; live/GitHub links and ReactGA events still
  fire.
- No glow on any card; hover = lift + border-brighten only.
- No visible copy changed; navbar unchanged.
- Light and dark both legible; Libre Baskerville actually loads.
