# Portfolio UI Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the whole portfolio page into a cohesive "glass / neon depth" system driven by a single accent color, with a cursor-following background spotlight and a screenshot-forward Projects section.

**Architecture:** A small set of accent tokens in the Tailwind v4 `@theme` block (`src/index.css`) is the single source of truth for color; all accent UI derives from it via `color-mix()`. A shared glass `.card`/`.chip`/`.glass` utility set gives every section the same surface. A `useCursorSpotlight` hook writes pointer position to CSS vars that a background gradient in `PageBackground` reads. Project cards become a single-column stack of glass cards featuring screenshots with a logo fallback.

**Tech Stack:** React 19, Vite 6, Tailwind CSS v4 (`@theme` in CSS, no `tailwind.config.js`), framer-motion, `@fontsource`.

**Testing note:** This project has **no unit-test framework configured** (no test runner in `package.json`). Verification for every task is: `npm run lint` (must pass), `npm run build` (must succeed), and visual inspection via `npm run dev` (or `vite`) in both light and dark mode. Do not invent a test runner — that is out of scope.

**Guardrails (do not violate):**
- Do **not** modify `src/components/Navbar.jsx` or its behavior.
- Do **not** change any visible copy/text. The only data change allowed is adding the `screenshot` field to `PROJECTS`.
- Preserve all existing `ReactGA.event(...)` calls.
- Cards must **not** glow. Hover = lift + border-brighten only.

---

## File Structure

- `src/index.css` — accent tokens, shadow-token unification, font/typography rules, glass `.card`/`.chip`/`.glass` utilities, link hover color. (Modify)
- `src/main.jsx` — import Inter + Libre Baskerville webfonts. (Modify)
- `src/hooks/useCursorSpotlight.js` — pointer-tracking hook writing `--mx`/`--my`. (Create)
- `src/components/PageBackground.jsx` — replace drifting blobs with cursor spotlight. (Modify)
- `src/constants/const.js` — add `screenshot` field to `PROJECTS`. (Modify)
- `src/assets/projects/` — new directory for screenshots (+ `.gitkeep`, `README.md`). (Create)
- `src/components/ProjectCard.jsx` — rebuild as screenshot-forward glass card with logo fallback. (Modify)
- `src/components/EducationCard.jsx` — coursework pills use `.chip`. (Modify)
- `src/components/Contact.jsx` — glass inputs + accent focus/button. (Modify)
- `src/components/TechSlider.jsx` — (no code change needed; inherits unified shadow tokens). Verified in Task 9.
- **No change:** `Navbar.jsx`, `ExperienceCard.jsx` (already uses `.card`), `Hero.jsx`, `Footer.jsx`, `Projects.jsx`, `Education.jsx`, `Experience.jsx`, `Technologies.jsx` (inherit via tokens/utilities/typography). Coverage confirmed in Task 11.

---

## Task 1: Load webfonts + typography split

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/main.jsx:1-9`
- Modify: `src/index.css:6-25`

- [ ] **Step 1: Install the serif webfont package**

Run:
```bash
npm install @fontsource/libre-baskerville
```
Expected: adds `@fontsource/libre-baskerville` to dependencies; `@fontsource-variable/inter` is already present.

- [ ] **Step 2: Import fonts in the entry file**

In `src/main.jsx`, add these imports immediately after the existing `import "./index.css";` line (line 4):

```jsx
import "@fontsource-variable/inter";
import "@fontsource/libre-baskerville/400.css";
import "@fontsource/libre-baskerville/700.css";
```

- [ ] **Step 3: Set the typography split in CSS**

In `src/index.css`, replace the `:root` block (lines 6-14) and the `body, html` block (lines 16-25) with:

```css
:root {
  font-family:
    "Inter Variable",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

body,
html {
  font-family:
    "Inter Variable",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Libre Baskerville", Georgia, "Times New Roman", serif;
}
```

- [ ] **Step 4: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed, no errors.

- [ ] **Step 5: Visual check**

Run `npm run dev`, open the page. Expected: body text now renders in Inter (clean sans), headings (`Jason Liu`, section titles like `Education`, card titles) render in Libre Baskerville serif. Confirm in both light and dark mode.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/main.jsx src/index.css
git commit -m "feat(design): load Inter + Libre Baskerville, serif headings / sans body"
```

---

## Task 2: Accent color tokens (single knob)

**Files:**
- Modify: `src/index.css:54-65` (the `@theme inline` block) and `src/index.css:88-90` (the `a` rule)

- [ ] **Step 1: Add accent tokens and unify purple-bearing shadow tokens**

In `src/index.css`, inside the `@theme inline { ... }` block, replace these existing lines:

```css
  --shadow-neon: 0 0 20px #280d3d;
  --shadow-neon-large: 0px 0px 30px #f2e6fe;
  --shadow-nyu-large: 0px 0px 60px #8900e1;
  --shadow-neon-white: 0px 0px 15px white;
  --shadow-neon-black: 0px 0px 15px black;
  --shadow-glow-purple: 0 0 40px rgba(137, 0, 225, 0.35);
```

with:

```css
  /* === Brand accent — change these two to recolor the entire page === */
  --color-accent: #57078c;
  --color-accent-strong: #8900e1;
  /* Existing `*-nyu` utilities follow the accent */
  --color-nyu: var(--color-accent);

  --shadow-neon: 0 0 20px var(--color-accent);
  --shadow-neon-large: 0px 0px 30px #f2e6fe;
  --shadow-nyu-large: 0px 0px 60px var(--color-accent-strong);
  --shadow-neon-white: 0px 0px 15px white;
  --shadow-neon-black: 0px 0px 15px black;
  --shadow-glow-purple: 0 0 40px color-mix(in srgb, var(--color-accent-strong) 35%, transparent);
```

Then delete the now-duplicate `--color-nyu: #57078c;` line that already exists lower in the same block (near line 64) so `--color-nyu` is defined only once (as `var(--color-accent)`).

- [ ] **Step 2: Make the global link hover use the accent token**

In `src/index.css`, in the `a { ... }` rule (lines 88-90), replace `hover:text-[#8900e1]` with `hover:text-[var(--color-accent-strong)]`. Leave the rest of the rule unchanged.

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 4: Visual check**

Run `npm run dev`. Expected: page looks unchanged from before (purple is still `#57078c`). This task only re-plumbs colors; the visual recolor proof happens in Task 11.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat(design): centralize color in --color-accent tokens"
```

---

## Task 3: Glass utility set

**Files:**
- Modify: `src/index.css:92-94` (the `.card` rule); add new `.chip` and `.glass` rules after it.

- [ ] **Step 1: Replace `.card` with the glass, no-glow version**

In `src/index.css`, replace the entire existing `.card { ... }` rule:

```css
.card {
  @apply text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-300 bg-white dark:bg-transparent hover:bg-purple-50/50 dark:hover:bg-[rgba(255,255,255,0.1)] border border-nyu/[.1]  hover:border-nyu/[.2] dark:hover:border-[rgba(255,255,255,0.1)] shadow-sm hover:shadow-lg dark:hover:shadow-glow-purple transition-all ease-in-out duration-300;
}
```

with:

```css
.card {
  @apply text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-300
    bg-white/60 dark:bg-white/[.05] backdrop-blur-md
    border border-black/10 dark:border-white/[.08]
    hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]
    dark:hover:border-[color-mix(in_srgb,var(--color-accent-strong)_45%,transparent)]
    shadow-sm hover:shadow-lg
    transition-all ease-in-out duration-300;
}

.glass {
  @apply bg-white/60 dark:bg-white/[.05] backdrop-blur-md border border-black/10 dark:border-white/[.08];
}

.chip {
  @apply px-2 py-1 rounded text-sm font-medium cursor-default transition-colors duration-200
    bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-accent)]
    dark:bg-[color-mix(in_srgb,var(--color-accent-strong)_18%,transparent)] dark:text-purple-100
    hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)]
    dark:hover:bg-[color-mix(in_srgb,var(--color-accent-strong)_30%,transparent)];
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Visual check**

Run `npm run dev`. Hover an Experience card (it already uses `.card`). Expected: it now lifts slightly and the border brightens; **no purple glow shadow**. Frosted/translucent surface visible.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat(design): glass card/chip/glass utilities, no card glow"
```

---

## Task 4: Cursor spotlight hook

**Files:**
- Create: `src/hooks/useCursorSpotlight.js`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useCursorSpotlight.js` with exactly:

```js
import { useEffect } from "react";

// Tracks the pointer and writes its viewport position to CSS custom
// properties (--mx / --my) on <html>, throttled to one write per frame.
// Skips tracking entirely when the user prefers reduced motion or is on a
// coarse / no-hover pointer (touch); in that case --mx/--my stay unset and
// consumers fall back to their CSS default position (a static glow).
export function useCursorSpotlight() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const root = document.documentElement;
    let frame = 0;
    let x = 0;
    let y = 0;

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty("--mx", `${x}px`);
        root.style.setProperty("--my", `${y}px`);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: passes (no unused vars, hooks rules satisfied).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCursorSpotlight.js
git commit -m "feat(design): add useCursorSpotlight hook"
```

---

## Task 5: Cursor spotlight in PageBackground

**Files:**
- Modify: `src/components/PageBackground.jsx` (full rewrite)

- [ ] **Step 1: Rewrite PageBackground**

Replace the entire contents of `src/components/PageBackground.jsx` with:

```jsx
import { useCursorSpotlight } from "@/hooks/useCursorSpotlight";

const PageBackground = () => {
  useCursorSpotlight();

  return (
    <>
      {/* Light mode base */}
      <div className="fixed inset-0 z-[-2] dark:hidden bg-[#fafafa]" />

      {/* Light mode cursor spotlight (gentle) */}
      <div
        className="fixed inset-0 z-[-1] dark:hidden pointer-events-none"
        style={{
          background:
            "radial-gradient(600px circle at var(--mx, 50%) var(--my, 40%), color-mix(in srgb, var(--color-accent) 10%, transparent), transparent 60%)",
        }}
      />

      {/* Dark mode base */}
      <div className="fixed inset-0 z-[-2] hidden dark:block bg-neutral-950" />

      {/* Dark mode grain overlay */}
      <div className="fixed inset-0 z-[-1] hidden dark:block pointer-events-none bg-grain opacity-60" />

      {/* Dark mode cursor spotlight (strong) */}
      <div
        className="fixed inset-0 z-[-1] hidden dark:block pointer-events-none"
        style={{
          background:
            "radial-gradient(650px circle at var(--mx, 50%) var(--my, 40%), color-mix(in srgb, var(--color-accent-strong) 38%, transparent), color-mix(in srgb, var(--color-accent) 16%, transparent) 35%, transparent 65%)",
        }}
      />
    </>
  );
};

export default PageBackground;
```

Note: the `var(--mx, 50%)` / `var(--my, 40%)` fallbacks (percent) produce a static centered glow when the hook does not set them (reduced-motion / touch). When the hook sets them (px), the glow follows the cursor.

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed. (The old `motion`/`useScroll`/`useTransform` imports are gone — confirm no leftover references.)

- [ ] **Step 3: Visual check**

Run `npm run dev`. Move the mouse around the page.
Expected (dark mode): a purple glow follows the cursor and lights the background; the drifting blobs are gone. (light mode): a faint tint follows the cursor. Then test the static fallback: in DevTools, emulate `prefers-reduced-motion: reduce` and reload — the glow should be centered and not follow.

- [ ] **Step 4: Commit**

```bash
git add src/components/PageBackground.jsx
git commit -m "feat(design): cursor-following background spotlight"
```

---

## Task 6: Screenshot data field + assets directory

**Files:**
- Create: `src/assets/projects/.gitkeep`
- Create: `src/assets/projects/README.md`
- Modify: `src/constants/const.js:199-284` (the `PROJECTS` array)

- [ ] **Step 1: Create the screenshots directory**

Run:
```bash
mkdir -p src/assets/projects && touch src/assets/projects/.gitkeep
```

- [ ] **Step 2: Document the screenshot convention**

Create `src/assets/projects/README.md` with:

```markdown
# Project screenshots

Drop project screenshots here. Recommended: **16:10 aspect ratio, ~1600×1000px**,
compressed (webp or png). The filename must match the `screenshot` field of the
matching entry in `src/constants/const.js`.

If a screenshot file is missing, the card automatically falls back to the
project's existing logo (`image` field).
```

- [ ] **Step 3: Add the `screenshot` field to each project**

In `src/constants/const.js`, add a `screenshot` key to every object in the `PROJECTS` array. Use these exact filenames (they sit in `src/assets/projects/`). Add the key next to each existing `image` key:

- Inky → `screenshot: "inky.png",`
- Lobster AI → `screenshot: "lobster.png",`
- PATH LIVE → `screenshot: "pathlive.png",`
- SHell → `screenshot: "shell.png",`
- BrownJack → `screenshot: "brownjack.png",`
- Terminal Portfolio → `screenshot: "terminal.png",`
- Portfolio Website (currently v2) → `screenshot: "portfolio.png",`

Example — the first entry becomes:

```js
  {
    title: "Inky",
    desc: "A group scheduling tool designed to streamline coordination, minimize back-and-forth, and save time for teams",
    technologies: ["Next.JS", "Drizzle", "XState", "TipTap", "Vitest"],
    urls: {
      live: "https://inky.jasonl.us/",
    },
    image: "inky.png",
    screenshot: "inky.png",
  },
```

Do not change any other field (titles, descriptions, urls, technologies, image are unchanged).

- [ ] **Step 4: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed. (Screenshot files don't exist yet; that's fine — the card handles missing files in Task 7.)

- [ ] **Step 5: Commit**

```bash
git add src/assets/projects/.gitkeep src/assets/projects/README.md src/constants/const.js
git commit -m "feat(projects): add screenshot field + screenshots asset dir"
```

---

## Task 7: Rebuild ProjectCard (screenshot-forward glass card)

**Files:**
- Modify: `src/components/ProjectCard.jsx` (full rewrite)

- [ ] **Step 1: Rewrite ProjectCard**

Replace the entire contents of `src/components/ProjectCard.jsx` with:

```jsx
import { useState } from "react";
import { FaLink, FaGithub } from "react-icons/fa6";
import { motion } from "framer-motion";
import ReactGA from "react-ga4";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const ProjectCard = ({ title, desc, urls, image, screenshot, technologies }) => {
  const [imgError, setImgError] = useState(false);
  const href = urls.live || urls.github;
  const logoSrc = new URL(`../assets/${image}`, import.meta.url).href;
  const screenshotSrc = screenshot
    ? new URL(`../assets/projects/${screenshot}`, import.meta.url).href
    : null;
  const showScreenshot = screenshotSrc && !imgError;

  return (
    <motion.div variants={cardVariants} className="mb-8 w-full max-w-3xl mx-auto">
      <div className="card rounded-2xl overflow-hidden group">
        <a href={href} target="_blank" rel="noreferrer" className="block">
          <div className="relative aspect-[16/10] flex items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]">
            {showScreenshot ? (
              <img
                src={screenshotSrc}
                alt={`${title} screenshot`}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <img
                src={logoSrc}
                alt={title}
                loading="lazy"
                className="max-h-2/3 max-w-1/2 object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
        </a>
        <div className="p-6">
          <h6 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h6>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 pb-4">
            {desc}
          </p>
          <div className="flex flex-wrap gap-2 pb-4">
            {technologies.map((tech, i) => (
              <span key={i} className="chip">
                {tech}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {urls.live && (
              <a
                href={urls.live}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  ReactGA.event({
                    category: "Projects",
                    action: "live_link_click",
                    label: title,
                  })
                }
              >
                <FaLink className="w-6 h-6 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-[var(--color-accent)] dark:hover:text-purple-300" />
              </a>
            )}
            {urls.github && (
              <a
                href={urls.github}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  ReactGA.event({
                    category: "Projects",
                    action: "github_link_click",
                    label: title,
                  })
                }
              >
                <FaGithub className="w-6 h-6 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-[var(--color-accent)] dark:hover:text-purple-300" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
```

Key points: the whole card uses the glass `.card`; the image area is `aspect-[16/10]`; missing/failed screenshots fall back to the logo (`onError` + `screenshot` presence check); tech use `.chip`; both ReactGA events preserved.

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Visual check**

Run `npm run dev`, scroll to Projects.
Expected: a centered single-column stack of glass cards. Since no screenshot files exist yet, each card shows its **logo** centered in the 16:10 panel (fallback working). Hover: card lifts + border brightens, image scales slightly, no glow. Click live/GitHub icons — links open and tracking fires.

- [ ] **Step 4: Drop one real screenshot to confirm the screenshot path**

(Manual / user-provided.) Place any 16:10 image at `src/assets/projects/inky.png` and reload. Expected: the Inky card now shows the screenshot (`object-cover`) instead of the logo. Remove it again if it was only a test.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.jsx
git commit -m "feat(projects): screenshot-forward glass card with logo fallback"
```

---

## Task 8: Education coursework pills → glass chips

**Files:**
- Modify: `src/components/EducationCard.jsx:42-49`

- [ ] **Step 1: Use the `.chip` utility**

In `src/components/EducationCard.jsx`, replace the coursework `<span>`'s className:

```jsx
            <span
              className="mr-2 mt-4 rounded bg-purple-100 dark:bg-[#280D3D] text-purple-900 dark:text-neutral-300 px-2 py-1 text-sm font-medium transition-all duration-200 hover:bg-purple-200 dark:hover:bg-[#3a0f4d] cursor-default"
              key={w}
            >
```

with:

```jsx
            <span className="chip mr-2 mt-4" key={w}>
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Visual check**

Run `npm run dev`, view Education. Expected: coursework tags match the project tech chips (accent-tinted glass pills); hover changes their tint. No hardcoded `#280D3D` purple remains here.

- [ ] **Step 4: Commit**

```bash
git add src/components/EducationCard.jsx
git commit -m "feat(design): education coursework uses shared chip style"
```

---

## Task 9: Verify Technologies / Experience inherit the system

**Files:**
- Inspect only: `src/components/TechSlider.jsx`, `src/components/ExperienceCard.jsx`

- [ ] **Step 1: Confirm no code change needed**

`TechSlider.jsx` uses `shadow-nyu-large dark:shadow-neon-large` and `border-nyu/10` — these now resolve through the unified accent tokens (Task 2), so no edit is required. `ExperienceCard.jsx` already uses the `.card` class, so it inherits the glass treatment from Task 3.

- [ ] **Step 2: Visual check**

Run `npm run dev`. Expected: the Technologies marquee border/glow still renders and will recolor with the accent (proved in Task 11). Experience cards are frosted glass with lift-on-hover and no glow. If either looks broken, fix the specific className inline; otherwise no change.

- [ ] **Step 3: No commit if no change**

If you made no edits, skip. If you adjusted a className, commit:
```bash
git add -A && git commit -m "fix(design): tech/experience token consistency"
```

---

## Task 10: Contact form → glass inputs + accent

**Files:**
- Modify: `src/components/Contact.jsx:117`, `:136`, `:155`, `:160-163`

- [ ] **Step 1: Glassify the three inputs**

In `src/components/Contact.jsx`, the `name` input, `email` input, and `message` textarea each currently use this className (the textarea also has `resize-none` appended):

```
w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all
```

Replace the className on all three with (keep the trailing ` resize-none` on the textarea):

```
w-full px-4 py-2 rounded-lg glass text-neutral-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] focus:border-transparent
```

(textarea className ends with `... focus:border-transparent resize-none`.)

- [ ] **Step 2: Accent the submit button**

Replace the submit button className:

```
mt-2 w-full px-6 py-3 rounded-lg bg-neutral-800 dark:bg-neutral-300 text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 hover:cursor-pointer
```

with:

```
mt-2 w-full px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-strong)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 hover:cursor-pointer
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 4: Visual check**

Run `npm run dev`, scroll to Contact. Expected: inputs are frosted glass; focusing one shows an accent ring (not blue); the submit button is accent-colored and darkens to `--color-accent-strong` on hover. Form still submits (status text cycles).

- [ ] **Step 5: Commit**

```bash
git add src/components/Contact.jsx
git commit -m "feat(design): glass contact inputs + accent button"
```

---

## Task 11: Final verification + single-knob recolor proof

**Files:**
- Temporary edit only: `src/index.css` (revert before finishing)

- [ ] **Step 1: Full build + lint**

Run: `npm run lint && npm run build`
Expected: both succeed with no warnings about missing modules.

- [ ] **Step 2: Spec coverage walkthrough (visual)**

Run `npm run dev`. In **both** light and dark mode confirm:
- Cursor spotlight follows the pointer; static centered glow under emulated reduced-motion.
- No card anywhere glows; hover = lift + border-brighten.
- Projects is a single-column glass stack with logo fallbacks (or screenshots if added).
- Education chips, project chips match.
- Contact inputs/button styled.
- Navbar unchanged; all text unchanged.
- Headings are serif, body is sans.

- [ ] **Step 3: Prove the single color knob**

Temporarily edit `src/index.css`: change `--color-accent: #57078c;` to `--color-accent: #0a7d3b;` (a green) and `--color-accent-strong: #8900e1;` to `--color-accent-strong: #12c25e;`. Save and view the dev server.
Expected: the **entire** page recolors — cursor spotlight, chips, card hover borders, section index labels (01·02·03), link hovers, contact button, tech marquee glow — all turn green, with no other edits.

- [ ] **Step 4: Revert the experiment**

Restore `--color-accent: #57078c;` and `--color-accent-strong: #8900e1;`.

Run: `git diff --stat`
Expected: no changes to `src/index.css` from the experiment (only the intended revamp commits remain).

- [ ] **Step 5: Final commit (only if anything was adjusted during verification)**

```bash
git add -A && git commit -m "chore(design): final revamp verification fixes"
```

(If nothing changed, skip.)

---

## Self-Review (completed during authoring)

- **Spec coverage:** color system (Tasks 2, 11) ✓; cursor spotlight both modes + fallback (Tasks 4–5) ✓; glass cards no-glow (Task 3) ✓; Projects screenshot-forward single-column + fallback (Tasks 6–7) ✓; cohesion across Education/Experience/Tech/Contact (Tasks 8–10) ✓; typography load + serif/sans split (Task 1) ✓; navbar/text guardrails (stated, enforced per task) ✓.
- **Placeholders:** none — every code/edit step contains literal content.
- **Type/name consistency:** `--color-accent` / `--color-accent-strong` / `--mx` / `--my` / `.chip` / `.glass` / `.card` / `useCursorSpotlight` / `screenshot` used identically across tasks.
