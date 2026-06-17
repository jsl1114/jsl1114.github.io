# Page Redesign "Spotlight" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio's first impression dramatically more striking — a dark "spotlight" stage with an oversized glowing name and a choreographed entrance — while keeping the NYU-purple palette, Libre Baskerville serif, all content, and full functionality.

**Architecture:** Pure frontend (React + Tailwind v4 + framer-motion). We add shared glow tokens/utilities in `index.css`, default the theme to dark, rebuild `Hero` and `PageBackground` for the dark+glow hero, and unify the section system with numbered headers via `SectionHero`. No backend, no new dependencies, no content changes.

**Tech Stack:** React 19, Tailwind CSS v4 (`@theme inline` in `src/index.css`), framer-motion (imported as `framer-motion`), Vite.

---

## Verification model (read first)

This is visual/motion work, not logic — there are no unit tests to write. Each task is verified two ways:

1. **Build check:** `npm run build` must succeed (catches syntax/import errors).
2. **Visual check:** `npx vite` (frontend only — avoids the DB tunnel in `npm run dev`), open the printed `localhost` URL, and confirm the described behavior in dark mode (default) and light mode (toggle, top-right).

Reduced-motion check where relevant: macOS System Settings → Accessibility → Display → Reduce motion, then reload.

Commit after each task.

---

## File Structure

- `src/index.css` — add glow/bloom tokens + `.text-glow`, `.hero-bloom` utilities (modify).
- `src/components/ThemeProvider.jsx` — default to dark when no stored preference (modify).
- `src/components/PageBackground.jsx` — layered dark radial glows + faint grain (modify).
- `src/components/Hero.jsx` — oversized glowing name, choreographed entrance, cursor spotlight, scroll cue (rewrite).
- `src/components/SectionHero.jsx` — optional numbered oversized header (modify).
- `src/components/Education.jsx`, `Experience.jsx`, `Projects.jsx` — pass section index to `SectionHero` (modify).
- `src/components/Contact.jsx` — numbered header matching `SectionHero` (modify).

---

## Task 1: Glow tokens, utilities, and dark-default theme

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/ThemeProvider.jsx`

- [ ] **Step 1: Add glow utilities and tokens to `src/index.css`**

Add these tokens inside the existing `@theme inline { ... }` block (alongside the current `--shadow-*` entries):

```css
  --shadow-glow-purple: 0 0 40px rgba(137, 0, 225, 0.35);
  --shadow-glow-purple-lg: 0 0 90px rgba(137, 0, 225, 0.45);
```

Then add these utility classes at the end of the file (after the existing `.group:hover .link-symbol` block):

```css
/* Oversized hero name glow (dark mode only) */
.dark .text-glow {
  text-shadow:
    0 0 25px rgba(137, 0, 225, 0.55),
    0 0 60px rgba(137, 0, 225, 0.35);
}

/* Radial purple bloom used behind the hero name */
.hero-bloom {
  background: radial-gradient(
    circle at center,
    rgba(137, 0, 225, 0.55) 0%,
    rgba(87, 7, 140, 0.25) 35%,
    transparent 70%
  );
}

/* Faint grain overlay for dark backgrounds */
.bg-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}
```

- [ ] **Step 2: Default the theme to dark in `src/components/ThemeProvider.jsx`**

Replace the `useState` initializer (lines 6–12) so that, with no saved preference, it defaults to dark:

```jsx
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    return "dark";
  });
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: build completes with no errors (a `dist/` is produced).

- [ ] **Step 4: Visual check**

Run: `npx vite`, open the printed URL in a fresh/incognito window (no stored `theme`).
Expected: page loads in dark mode. Toggle (top-right) still switches to light and back.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/components/ThemeProvider.jsx
git commit -m "feat(design): add glow tokens/utilities and default to dark theme"
```

---

## Task 2: Layered dark background with depth

**Files:**
- Modify: `src/components/PageBackground.jsx`

- [ ] **Step 1: Replace the dark-mode background block**

Replace the entire "Dark mode background color" + "Dark mode animated background" section (current lines 42–67) with a layered version: a base black, a faint grain overlay, and two offset radial purple glows (one of which keeps the existing scroll-driven `topPos` motion). Keep the light-mode blocks (lines 9–40) unchanged.

```jsx
      {/* Dark mode background color */}
      <div className="fixed inset-0 z-[-2] hidden dark:block bg-neutral-950" />

      {/* Dark mode grain overlay */}
      <div className="fixed inset-0 z-[-1] hidden dark:block pointer-events-none bg-grain opacity-60" />

      {/* Dark mode animated glows */}
      <div className="fixed inset-0 z-[-1] hidden dark:block overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute inset-0"
        >
          <motion.div
            style={{ top: topPos }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.45, 0.75, 0.45],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(87,7,140,0.75),transparent_70%)]"
          />
          <motion.div
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(137,0,225,0.4),transparent_70%)]"
          />
        </motion.div>
      </div>
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 3: Visual check**

Run: `npx vite`, open the URL in dark mode.
Expected: black canvas with subtle grain texture and two soft purple glows (one centered/top, one lower-right) that drift slowly. Scrolling still moves the top glow up. Light mode unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/PageBackground.jsx
git commit -m "feat(design): layered dark background with grain and dual purple glows"
```

---

## Task 3: Hero — oversized glowing name with choreographed entrance and cursor spotlight

**Files:**
- Rewrite: `src/components/Hero.jsx`

- [ ] **Step 1: Rewrite `src/components/Hero.jsx`**

Replace the whole file. This keeps the holiday typewriter and the intro paragraph/content, adds: a cursor-reactive purple bloom (parallax via framer-motion springs, disabled for reduced-motion / touch), an oversized name that fills the first screen, a staggered word-by-word reveal, an eyebrow kicker with an "available" status dot, and a scroll cue.

```jsx
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import NewYearTypeWriter from "./HolidayTypeWriter";

const nameWords = ["Jason", "Liu"];

const wordVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.5 + i * 0.15,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const fadeUp = (delay) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  },
});

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);

  // Cursor-reactive bloom position (springy parallax).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bx = useSpring(mx, { stiffness: 60, damping: 20 });
  const by = useSpring(my, { stiffness: 60, damping: 20 });

  const handleMouseMove = (e) => {
    if (reduceMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // Offset from center, dampened.
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.15);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.15);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-[88vh] flex-col items-center justify-center pt-24 pb-10"
    >
      {/* Cursor-reactive bloom behind the name (dark mode) */}
      <motion.div
        style={{ x: bx, y: by }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hero-bloom pointer-events-none absolute z-[-1] hidden h-[60vw] max-h-[600px] w-[60vw] max-w-[600px] rounded-full blur-2xl dark:block"
      />

      <div className="w-full text-center">
        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <NewYearTypeWriter />
        </motion.div>

        {/* Eyebrow kicker with availability dot */}
        <motion.div
          variants={fadeUp(0.35)}
          initial="hidden"
          animate="visible"
          className="mb-6 flex items-center justify-center gap-2 text-sm uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8900e1] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8900e1]" />
          </span>
          CS @ NYU · Full-Stack Developer
        </motion.div>

        {/* Oversized glowing name */}
        <h1
          className="text-glow mb-8 flex flex-wrap justify-center gap-x-6 font-bold leading-[0.95] tracking-tighter text-neutral-900 dark:text-white"
          style={{ fontSize: "clamp(3.5rem, 16vw, 11rem)" }}
        >
          {nameWords.map((word, i) => (
            <motion.span
              key={word}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={fadeUp(1.0)}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-2xl px-4 text-lg text-neutral-600 dark:text-neutral-400"
        >
          Hi, I'm Jason! I am a cs undergrad at{" "}
          <a href="https://nyu.edu" target="_blank" rel="noreferrer">
            New York University
          </a>
          . I love building things and solving problems. I enjoy Full-Stack
          Development, Multimodal Learning and NLP. When I am not coding, I am
          probably fishing, playing badminton or buying mechanical keyboards.
        </motion.p>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={reduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-6 rounded-full border border-neutral-400/60 dark:border-neutral-600 flex items-start justify-center p-1.5"
        >
          <span className="h-2 w-1 rounded-full bg-neutral-500 dark:bg-neutral-400" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 3: Visual check (dark)**

Run: `npx vite`, open in dark mode.
Expected on load: kicker (with pulsing purple dot) fades in → "Jason" then "Liu" rise word-by-word, huge and filling the screen, with a purple glow on the text and a bloom behind them → intro paragraph fades up → scroll cue appears and bobs at the bottom. Moving the mouse makes the bloom drift toward the cursor with a springy lag.

- [ ] **Step 4: Visual check (light + reduced motion)**

Toggle to light mode: name is dark with no purple text-glow (glow is dark-only), bloom hidden, layout intact.
Enable "Reduce motion" and reload: entrance still resolves to final state, bloom does not track the cursor, scroll cue does not bob.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.jsx
git commit -m "feat(design): oversized glowing hero name with cursor spotlight and entrance"
```

---

## Task 4: Numbered, oversized section headers

**Files:**
- Modify: `src/components/SectionHero.jsx`
- Modify: `src/components/Education.jsx`
- Modify: `src/components/Experience.jsx`
- Modify: `src/components/Projects.jsx`
- Modify: `src/components/Contact.jsx`

- [ ] **Step 1: Add an optional `index` to `SectionHero.jsx`**

Replace the file with a version that, when given a two-digit `index` (e.g. `"01"`), renders it as a purple monospace label above an oversized serif title with a short purple accent rule. When `index` is omitted, it falls back to the current look.

```jsx
import { subtitleVariants, titleVariants } from "@/constants/variants.js";
import { motion } from "framer-motion";

const SectionHero = ({ title, subTitle, index }) => {
  return (
    <div className="flex lg:justify-center items-end">
      <div className="w-full lg:w-1/4">
        {index && (
          <motion.div
            variants={subtitleVariants}
            className="mb-2 flex items-center gap-3 font-mono text-sm tracking-widest text-nyu dark:text-purple-300"
          >
            {index}
            <span className="h-px w-10 bg-nyu/40 dark:bg-purple-300/40" />
          </motion.div>
        )}
        <motion.h1
          variants={titleVariants}
          className={`mt-2 font-semibold tracking-tight text-neutral-900 dark:text-white ${
            index ? "text-5xl lg:text-6xl" : "text-4xl mt-10"
          } ${!subTitle && "mb-12"}`}
        >
          {title}
        </motion.h1>
        {subTitle && (
          <motion.h2
            variants={subtitleVariants}
            className="mb-8 mt-2 text-md text-neutral-600 dark:text-neutral-400 max-w-none"
          >
            {subTitle}
          </motion.h2>
        )}
      </div>
      <div className="w-full max-w-xl lg:w-3/4"></div>
    </div>
  );
};
export default SectionHero;
```

- [ ] **Step 2: Pass `index` in `Education.jsx`**

Change the `SectionHero` usage (line 17) to:

```jsx
      <SectionHero index={"01"} title={"Education"} subTitle={"Learning Stuff"} />
```

- [ ] **Step 3: Pass `index` in `Experience.jsx`**

Find the `<SectionHero ... />` usage in `src/components/Experience.jsx` and add `index={"02"}` as its first prop (keep its existing `title`/`subTitle`). Example:

```jsx
      <SectionHero index={"02"} title={"Experience"} subTitle={"Doing Work"} />
```

(Use the file's existing `title`/`subTitle` strings — only add the `index` prop.)

- [ ] **Step 4: Pass `index` in `Projects.jsx`**

Change the `SectionHero` usage (line 26) to:

```jsx
      <SectionHero index={"03"} title={"Projects"} subTitle={"Having Fun"} />
```

- [ ] **Step 5: Give `Contact.jsx` a matching numbered header**

Contact uses an inline title rather than `SectionHero`. Replace its title/subtitle block (current lines 78–89) with a centered numbered header matching the new style:

```jsx
      <motion.div
        variants={subtitleVariants}
        className="mb-2 flex items-center justify-center gap-3 font-mono text-sm tracking-widest text-nyu dark:text-purple-300"
      >
        04
        <span className="h-px w-10 bg-nyu/40 dark:bg-purple-300/40" />
      </motion.div>
      <motion.h1
        variants={titleVariants}
        className="text-5xl lg:text-6xl tracking-tight font-semibold text-center text-neutral-900 dark:text-white mb-2"
      >
        Contact
      </motion.h1>
      <motion.h2
        variants={subtitleVariants}
        className="text-md text-center text-neutral-600 dark:text-neutral-400 mb-8"
      >
        Reach out!
      </motion.h2>
```

- [ ] **Step 6: Build check**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 7: Visual check**

Run: `npx vite`. Scroll through the page.
Expected: Education / Experience / Projects / Contact each show a purple monospace number (`01`–`04`) with a short accent rule above a noticeably larger serif title. Reveal-on-scroll animations still fire once per section.

- [ ] **Step 8: Commit**

```bash
git add src/components/SectionHero.jsx src/components/Education.jsx src/components/Experience.jsx src/components/Projects.jsx src/components/Contact.jsx
git commit -m "feat(design): numbered oversized section headers"
```

---

## Task 5: Card glow consistency + final full-page verification

**Files:**
- Modify: `src/index.css` (`.card` only)

- [ ] **Step 1: Strengthen the dark-mode card glow**

In `src/index.css`, the `.card` class currently uses `dark:hover:shadow-neon` (a dim `#280d3d` glow). Update only the dark hover shadow to the new brighter purple glow token so cards "light up" on hover consistently with the hero. Change `dark:hover:shadow-neon` to `dark:hover:shadow-glow-purple` in the `.card` `@apply` line. Leave the rest of the `.card` rule unchanged.

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 3: Full-page visual check**

Run: `npx vite`.
- Dark mode (default): hero entrance + spotlight read as a clear "wow"; background has depth; section numbers present; hovering project/education/experience cards produces a purple glow.
- Light mode (toggle): clean white, purple accents, no dark-only glows, everything legible and aligned.
- Reduced motion: entrance resolves, no looping/parallax motion.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat(design): brighter purple glow on card hover"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** dark-default + tokens (Task 1), layered dark background (Task 2), oversized glowing name + entrance + cursor spotlight + scroll cue + kicker (Task 3), numbered section headers across all four sections (Task 4), card glow consistency + final cross-mode/ reduced-motion verification (Task 5). Light mode preserved; content, typewriter, navbar, tech slider untouched. All spec sections mapped.
- **Placeholder scan:** none — every code step shows real code. Experience.jsx step intentionally references the file's own existing `title`/`subTitle` strings because the exact copy isn't in this plan's context; the instruction is concrete (add `index={"02"}`).
- **Type/name consistency:** utility names (`.text-glow`, `.hero-bloom`, `.bg-grain`, `--shadow-glow-purple`) and the `index` prop are defined in Task 1/Task 4 and used consistently thereafter.
