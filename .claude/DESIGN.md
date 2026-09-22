# Design rules — Minimalist Editorial

The visual system for jsl1114.github.io. Read this before changing anything that
affects how the site looks. The system is deliberately narrow: when a choice
isn't covered here, pick the quieter option.

## The idea

High-contrast editorial. A serif display face carries every heading, a neutral
sans carries everything else, and the palette is monochrome — no brand hue.
Motion exists only to introduce content, never to decorate it.

## Typography

| Role | Face | Weight | Notes |
| --- | --- | --- | --- |
| Display (`h1`–`h6`) | Instrument Serif | **400 only** | Loaded from Google Fonts in `index.html` |
| Body, UI, navigation | Inter Variable | 400 copy / 500 UI | Loaded from `@fontsource-variable/inter` |

- **Never put `font-bold` or `font-semibold` on a heading.** Instrument Serif
  ships one weight, so a bold utility synthesises a fake bold and the headline
  smears. The rule lives in `@layer base` in `src/index.css`.
- Hero `h1`: 80px desktop / 64px at `sm` / 48px mobile, `line-height: 0.95`,
  `letter-spacing: -0.0308em`. That em value is exactly **-2.46px at 80px** and
  keeps the same optical tightness at the smaller sizes. Do not loosen it — the
  tight tracking is the whole editorial effect.
- Section headings: `text-5xl lg:text-6xl`, `tracking-[-0.025em]`.
- Sub-headers are Inter at 18px. A sub-header that is markup-wise an `h2` needs
  an explicit `font-sans` to opt out of the display face.
- Nav and buttons: Inter 14px / 500. Hero CTA: 16px / 500.
- Body copy: 18px in the hero, 14–16px in cards, `line-height: 1.625`.

## Colour

Tokens live in the `@theme inline` block of `src/index.css`. Use the token, not
a raw hex.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-ink` | `#0f172a` | — | Primary text |
| `--color-muted` | `hsl(215 25% 32%)` | — | Body copy, metadata |
| `--color-muted-dark` | — | `hsl(215 16% 65%)` | Body copy in dark mode |
| `--color-accent-strong` | `#000000` | — | Filled actions |
| Page ground | `#fafafa` | `#0b1120` | `PageBackground.jsx` |

- Headings are `text-neutral-900 dark:text-white`. Body copy is
  `text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]`.
- Borders are hairlines: `border-black/10 dark:border-white/[.08]`, going to
  `/25`–`/35` on hover. No coloured borders.
- **There is no accent hue.** `--color-accent` and the legacy `*-nyu` utilities
  both resolve to the ink so old class names keep working. If a new element
  wants colour to carry meaning, use weight or a rule instead.
- Dark mode is a first-class counterpart, not an afterthought — the spec this
  system came from was light-only, but the site has a theme toggle wired
  through every component. Every rule above has a `dark:` answer.

## Motion

One gesture: **fade-rise** — `opacity 0 → 1` while `translateY(24px) → 0`, over
`0.8s ease-out`. Siblings stagger in 200ms steps (0s, 0.2s, 0.4s).

- Hero uses the CSS version (`.fade-rise`, `.fade-rise-delay-1`,
  `.fade-rise-delay-2`) so the headline paints on the first frame instead of
  waiting for hydration.
- Everything below the fold uses the framer-motion version in
  `src/constants/variants.js`, triggered by `whileInView` with `once: true`.
- Hover is a `scale(1.03)` over 200ms `ease-in-out`, and only on buttons.
- `.fade-rise` is disabled under `prefers-reduced-motion`, and the pill's hover
  scale is neutralised by `motion-reduce:hover:scale-100`.
- No glows, no neon shadows, no gradient text, no drop shadows. The old
  `--shadow-neon*` / `--shadow-glow-purple` tokens were deleted; don't bring
  them back.

## Components

Defined in `@layer components` in `src/index.css`:

- `.pill` — the primary action. `border-radius: 9999px`, black on light / white
  on dark, `10px 24px`, 14px/500. It re-states its hover colour so the global
  `a:hover` rule can't repaint it.
- `.pill-lg` — the hero size: `20px 56px`, 16px.
- `.pill-ghost` — secondary. Same geometry, hairline border, no fill.
- `.card` / `.glass` — translucent ground, hairline border, blur. No shadow.
- `.chip` — a hairline *label*, not a filled badge.

### Layering matters

Custom rules must sit inside `@layer base`, `@layer components` or
`@layer utilities`. Unlayered CSS beats every layered rule in the cascade, so an
unlayered `.pill` would defeat a `hidden` or `py-3` utility written next to it
in a `className`. Likewise the `h1`–`h6` font rule sits in `base` so a
`font-sans` utility can still override it.

## Entry curtain

On first paint two ink panels meet in the middle carrying the `jl` monogram,
which fades up, holds, then fades out as the panels part outward to uncover the
page — about 2.45s end to end. It is meant to be noticed; don't shorten it back
into a blink.

Timeline: mark `1.75s` from `0.05s` (fade up by 22%, hold to 64%, out by 100%),
panels `1.2s` from `1.25s`, node removed at `2550ms`.

- It lives as plain HTML/CSS/JS **inline in `index.html`**, not as a React
  component, so it covers the viewport from the very first paint instead of
  waiting for the bundle. The same file resolves the saved theme onto `<html>`
  before paint, which is what keeps the curtain (and the page behind it) from
  flashing the wrong colour.
- `#curtain` is `pointer-events: none` throughout and the node removes itself
  after 1250ms, so it can never trap a click.
- Panels are `#0f172a` on light, `#1b2437` on dark — the curtain must contrast
  with the ground it covers or the parting is invisible.
- `--enter-delay` (on `html`, in `src/index.css`, currently `1.55s`) offsets
  every `.fade-rise` so the hero copy rises *into* the opening rather than
  playing behind a closed curtain. Change the curtain timing and change this
  with it.
- The curtain script sets `data-entered` on `<html>` at `3100ms`, which drops
  `--enter-delay` to `0s`. Without it a client-side route change back to the
  hero would sit blank for 1.5s with no curtain to explain it. It fires *after*
  the removal so it can never retime an animation that is still running.
- Under `prefers-reduced-motion` the curtain is `display: none` and removed
  immediately, and `.fade-rise` is already disabled — so the reduced-motion
  render is just the finished page.

## Layout

- The landing view is one screen: `#hero` is `min-h-svh` and vertically centres
  the hero copy **and** the technology slider together. Anything added to that
  section has to earn its height. How it stays on one screen:
  - **The vertical rhythm is `svh`-clamped, not fixed.** Section padding, the
    gap above the slider and the slider's own card size are all
    `clamp(min, Nsvh, max)`, so the whitespace collapses on a short laptop
    before anything is pushed below the fold. That elasticity is worth about
    135px between a 768- and a 900-tall viewport.
  - Both children carry `shrink-0`. Without it the flex column silently
    *squashes* them to fit, which clips copy and makes the section measure as
    though it fits when it does not.
  - The slider always runs **two mirrored rows**. The cards carry the height
    instead: `clamp(56px,8svh,72px)` at the base breakpoint, `clamp(88px,13svh,120px)`
    at `lg`. Dropping to one row on phones was tried and reverted — the pair is
    the point, and the svh clamp buys back the height anyway.
  - Below roughly 720px of viewport height the content does exceed the screen.
    That is the intended failure: the page simply scrolls, and the cue is
    `fixed` so it stays visible to say so.
- Body copy steps up by viewport rather than staying small: 15px, 16px from
  `min-[380px]`, 17px at `sm`, 18px at `lg`. 14px was too small to read
  comfortably on a phone — don't go back below 15px.
- Nav: fixed, 3-column grid (`auto 1fr auto`), max-width 1280px. **The `jl`
  monogram (`src/assets/logo.svg`) is the brand mark** — left column, with the
  original `brightness-50 contrast-125 saturate-150` treatment that darkens it
  for light mode. It also carries the 404 page and the entry curtain. Do not
  substitute a typographic "Jason Liu" wordmark for it. Section links centred
  at 14px with 40px gaps,
  CV + theme toggle right at every width. It narrows to 4/5 width
  and picks up a blurred ground past 24px of scroll (8px to expand again — the
  hysteresis stops trackpad jitter flipping it).
- **The section links belong to the collapsed bar only.** At the top of the
  page the page itself is the navigation, and a row of section names competes
  with the name it sits above. The middle cell stays mounted and fades on
  `isScrolled`, so collapsing doesn't shift the grid, and it goes inert
  (`pointer-events-none`, `aria-hidden`, `tabIndex={-1}`) rather than
  unmounting, so nothing invisible stays tabbable. Do **not** wrap it in a
  second `AnimatePresence` — one fighting the existing `mode="popLayout"` swap
  leaves the collapsed bar empty.
- The active marker is a rule, not a dot — the bar is `overflow-hidden`, so
  anything hanging below the link gets clipped.
- The nav carries **no social icons or Get in touch button**. Direct channels
  live in the contact section; the CV and theme toggle remain in the navbar at
  every width. There is no separate floating mobile theme toggle.
- Below `lg`, the middle cell shows only the current section name, except
  Home, which leaves the middle cell empty. Names crossfade upward through a clipped single-line window
  as the scroll spy changes section; reduced motion makes the swap immediate.
- Hero: `min-h-[calc(100svh-7rem)]`, centred, content capped at 1280px and the
  paragraph at 670px.
- Sections are separated by a single hairline, never a filled band.
- `svh` (not `vh`) everywhere a full screen is wanted, so mobile browser chrome
  doesn't push content out of view.

## The hero bio

Long centred copy is the hardest thing on the page to make look deliberate.
Three rules keep it honest:

- **Short measure.** `max-w-[54ch]` centred. Centred text falls apart past
  ~55 characters a line.
- **Two paragraphs, not one slab**, so the block has internal structure.
- `text-pretty` throughout, to keep the rag even and the last line off an
  orphan.
- It stays **centred and single-column at every width** — 54ch, widening to
  58ch at `lg` where the larger type needs it. A two-column split was tried and
  rejected: it halves the height but reads as a spread rather than an
  introduction. The svh-clamped rhythm alone is enough to keep the landing view
  on one screen, so the height saving isn't needed.

## Contact

Two columns from `lg`, stacked below it: the message form on the left, direct
channels on the right. Channels come from `CONTACT_CHANNELS` in
`src/constants/const.js` — add one there, not in the component.

**No email channel.** Email is deliberately not listed anywhere on the page:
it's on the CV, and the point is that people read that first. The form's own
Email field is the *visitor's* address and is unrelated. The public channels are LinkedIn, GitHub, and Google Meet. Do not
expose a direct email address here or in the terminal demo; visitors can find
it in the resume. The message form remains available.

Each channel is a hairline-ruled row (`border-b`, `first:border-t`) carrying an
icon, a 10px uppercase label at `.14em` tracking, the value in ink, and a
`.link-symbol` arrow that steps out on hover. No filled badges, no cards — the
rule *is* the structure, same as the rest of the page.

## Scroll cue

`src/components/ScrollCue.jsx` — the only hint that anything exists below a
full-screen landing view. `fixed` (not absolute), fades in after the curtain and
the staggered copy have settled, fades out past 40px of scroll, returns at the top, and its
chevron bob is dropped under `prefers-reduced-motion`.

## Routing

`src/pages/NotFound.jsx` is the `path="*"` catch-all. GitHub Pages serves
`404.html` for unknown paths and `npm run deploy` copies `index.html` over it,
so a deep link boots the SPA and falls through to that route.

## Things deliberately not done

- **No background video.** The source spec called for a full-bleed hero video,
  but the asset it named belongs to a third party's GitHub Pages and shows
  unrelated artwork. If one is ever wanted, it goes in `PageBackground.jsx`
  behind a `rgba(0,0,0,0.2)` scrim so the copy stays legible.
- **No accent colour.** See above — this is a choice, not an omission.
- **No hero CTA button or navbar contact pill.** Contact remains a page section;
  the hero keeps the height its introduction and technology rows need.

## Known pre-existing issues (not part of this system)

- `src/components/Aurora.jsx` is empty, and `ContactDock.jsx` / `GlassIcons/`
  are unreferenced. `dockVariants` in `variants.js` is only used by commented-out
  code in `Contact.jsx`. None of these are styled to this system.
- `npm run lint` fails before it reaches any source file: `eslint.config.js`
  has invalid array/object syntax in its `overrides` block. This is present in
  HEAD and predates the redesign.
- `TechSlider` builds icon URLs as `cdn.simpleicons.org/<tech>/<tech>`, using the
  slug as the colour; most of those requests return 403. Note when debugging
  the slider in headless Chrome: the marquee also fast-forwards under
  `--virtual-time-budget`, so an empty-looking row there is usually an artifact,
  not a layout bug. Disable animations before trusting the screenshot.
- More generally, framer-motion's `AnimatePresence` swaps often fail to settle
  under headless Chrome, which makes the collapsed navbar screenshot as empty.
  Pass `--force-prefers-reduced-motion` to make those swaps instant and
  deterministic before concluding anything is broken.
