import HolidayTypeWriter from "./HolidayTypeWriter";

// Entrance is CSS rather than framer-motion so the headline paints with the
// first frame instead of waiting for hydration. The delays are offset by
// --enter-delay so the copy rises as the entry curtain parts.
//
// The vertical rhythm is svh-clamped rather than fixed: the hero and the
// technology slider have to share one screen, so the gaps give way first on a
// short laptop instead of pushing the slider below the fold.
const Hero = () => {
  return (
    <div className="shrink-0 text-center">
      {/* Collapses on the ~360 days a year that aren't a holiday. */}
      <div className="fade-rise mb-3 empty:mb-0 sm:mb-4">
        <HolidayTypeWriter />
      </div>

      {/* -0.0308em resolves to exactly -2.46px at the 80px desktop size and
          holds the same optical tightness at the smaller breakpoints. */}
      <h1 className="fade-rise text-[clamp(56px,15vw,80px)] leading-[0.95] tracking-[-0.0308em] text-neutral-900 dark:text-white">
        Jason{" "}
        <em className="not-italic text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          Liu
        </em>
      </h1>

      <p className="fade-rise fade-rise-delay-1 mt-[clamp(12px,2svh,24px)] text-[16px] font-medium tracking-[0.02em] text-neutral-900 sm:text-[18px] dark:text-white">
        Full-Stack Developer
      </p>

      {/* Centred copy only holds together on a short measure, so the bio stays
          at ~54 characters a line and breaks into two paragraphs rather than
          running as one slab. */}
      <div className="fade-rise fade-rise-delay-2 mx-auto mt-[clamp(16px,2.5svh,28px)] max-w-[54ch] text-[15px] leading-[1.55] text-pretty text-[var(--color-muted)] min-[380px]:text-[16px] min-[380px]:leading-[1.6] sm:text-[17px] sm:leading-[1.65] lg:max-w-[58ch] lg:text-[18px] lg:leading-[1.6] dark:text-[var(--color-muted-dark)]">
        <p className="mb-3 sm:mb-4">
          Hi, I'm Jason! I am a software engineer focused on building scalable
          products and solving practical problems.
        </p>
        <p>
          I have experience across full stack development and AI related
          systems, with a strong interest in designing reliable software,
          improving system performance, and turning complex ideas into usable
          tools. I enjoy working across the stack and am especially interested
          in multimodal AI, data driven applications, and building products that
          people rely on every day.
        </p>
      </div>
    </div>
  );
};
export default Hero;
