import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { Maximize2, X } from "lucide-react";

const AUTO_MS = 5000;

// Screenshot preview for a project card. Auto-advances (pausing on hover, when
// the lightbox is open, and when reduced motion is requested) and offers manual
// arrows + dots. Clicking an image opens a full-size lightbox. Images that fail
// to load drop out; if none remain it shows a calm accent panel so the card
// never renders a broken image.
const ProjectCarousel = ({ images, title }) => {
  const reduce = useReducedMotion();
  const [errored, setErrored] = useState(() => new Set());
  const [pos, setPos] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const okIndices = images.map((_, i) => i).filter((i) => !errored.has(i));
  const count = okIndices.length;

  useEffect(() => {
    if (pos > count - 1) setPos(count > 0 ? count - 1 : 0);
  }, [count, pos]);

  useEffect(() => {
    if (reduce || paused || lightbox || count < 2) return;
    const id = setInterval(() => setPos((p) => (p + 1) % count), AUTO_MS);
    return () => clearInterval(id);
  }, [reduce, paused, lightbox, count]);

  if (count === 0) {
    return (
      <div className="aspect-video w-full bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]" />
    );
  }

  const activeIndex = okIndices[Math.min(pos, count - 1)];
  const go = (delta) => setPos((p) => (p + delta + count) % count);

  return (
    <>
      <div
        className="relative aspect-video w-full overflow-hidden bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={`${title} screenshot ${pos + 1}`}
            loading="lazy"
            onError={() => setErrored((prev) => new Set(prev).add(activeIndex))}
            onClick={() => setLightbox(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
          />
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous screenshot"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <FaChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Next screenshot"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <FaChevronRight className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
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

      <DialogPrimitive.Root open={lightbox} onOpenChange={setLightbox}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 z-50 w-[min(96vw,1400px)] -translate-x-1/2 -translate-y-1/2 outline-none"
          >
            <DialogPrimitive.Title className="sr-only">
              {title} screenshots
            </DialogPrimitive.Title>

            <img
              src={images[activeIndex]}
              alt={`${title} screenshot ${pos + 1}`}
              className="mx-auto max-h-[88vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />

            <DialogPrimitive.Close
              aria-label="Close"
              className="absolute -top-3 -right-3 grid place-items-center h-10 w-10 rounded-full bg-white text-neutral-900 shadow-lg hover:bg-neutral-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>

            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous screenshot"
                  onClick={() => go(-1)}
                  className="absolute left-2 sm:-left-14 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                  <FaChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next screenshot"
                  onClick={() => go(1)}
                  className="absolute right-2 sm:-right-14 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                  <FaChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
                  {pos + 1} / {count}
                </div>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
};

export default ProjectCarousel;
