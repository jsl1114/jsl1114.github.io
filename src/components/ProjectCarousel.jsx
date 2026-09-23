import { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const AUTO_MS = 5000;
const FADE_MS = 400;

// Screenshot preview for a project card. Auto-advances (pausing on hover, when
// the card has focus, and when reduced motion is requested) and offers manual
// arrows + dots. The card link opens the detail page. Images that fail
// to load drop out; if none remain it shows a calm accent panel so the card
// never renders a broken image. Slides stay mounted; only the incoming one
// fades, over the outgoing one (`settled`) held opaque beneath it, which is
// dropped on transitionend. Fading both at once would leave them near 0.5
// mid-transition — 0.75 composite coverage, flashing the panel behind them.
// The fade is a CSS transition, not a motion one: motion runs opacity through
// WAAPI on Chrome's compositor and commits the final value from a main-thread
// onfinish, and the frame between the two paints the base opacity, flashing the
// outgoing image over the incoming one.
const ProjectCarousel = ({ images, title, paused = false }) => {
  const reduce = useReducedMotion();
  const [errored, setErrored] = useState(() => new Set());
  const [pos, setPos] = useState(0);
  const [settled, setSettled] = useState(0);

  const okIndices = images.map((_, i) => i).filter((i) => !errored.has(i));
  const count = okIndices.length;

  useEffect(() => {
    if (pos > count - 1) setPos(count > 0 ? count - 1 : 0);
    if (settled > count - 1) setSettled(count > 0 ? count - 1 : 0);
  }, [count, pos, settled]);

  useEffect(() => {
    if (reduce || paused || count < 2) return;
    const id = setTimeout(() => setPos((p) => (p + 1) % count), AUTO_MS);
    return () => clearTimeout(id);
  }, [reduce, paused, count, pos]);

  if (count === 0) {
    return (
      <div className="aspect-video w-full bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]" />
    );
  }

  const go = (delta) => setPos((p) => (p + delta + count) % count);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]">
      {okIndices.map((idx, i) => {
        const current = i === pos;
        const under = !reduce && i === settled;
        return (
          <img
            key={idx}
            src={images[idx]}
            alt={`${title} screenshot ${i + 1}`}
            onError={() => setErrored((prev) => new Set(prev).add(idx))}
            onTransitionEnd={(e) =>
              e.propertyName === "opacity" && current && setSettled(i)
            }
            style={{
              transitionDuration: reduce ? "0ms" : `${FADE_MS}ms`,
              pointerEvents: current ? "auto" : "none",
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out ${
              current
                ? "opacity-100 z-[2]"
                : under
                  ? "opacity-100 z-[1]"
                  : "opacity-0 z-0"
            }`}
          />
        );
      })}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous screenshot"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <FaChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Next screenshot"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <FaChevronRight className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 flex gap-1.5">
            {okIndices.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to screenshot ${i + 1}`}
                onClick={() => setPos(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === pos ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectCarousel;
