import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHomeEntrance } from "@/hooks/useHomeEntrance";

// First visit: the curtain parts at --enter-delay (1.55s) and the last hero
// line finishes rising 0.4s + 0.8s later, around 2.75s. Keep this in step with
// the curtain timing in DESIGN.md. Later mounts and reduced motion skip the
// entrance, so there is nothing to wait for.
const ENTRANCE_SETTLED_MS = 2900;
const RETURN_REVEAL_MS = 300;

// The landing view fills the screen, so this is the only hint that there is
// more below. It fades out while scrolled away from the top.
const ScrollCue = ({ targetId }) => {
  const [atTop, setAtTop] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const firstVisit = useHomeEntrance();

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Wait until every line of the hero copy has settled.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(
      () => setRevealed(true),
      firstVisit && !reducedMotion ? ENTRANCE_SETTLED_MS : RETURN_REVEAL_MS,
    );
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [firstVisit]);

  const visible = atTop && revealed;

  return (
    <button
      type="button"
      onClick={() =>
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      aria-label="Scroll to the next section"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        // Same ground as the collapsed navbar, so the two bars read as a pair.
        // Tucked into the corner on phones, where the landing view is already
        // full; centred from sm up, where there is room below the slider.
        "fixed right-[calc(env(safe-area-inset-right)+1.25rem)] bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-10 flex cursor-pointer items-center rounded-full p-1.5 sm:right-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2",
        "border border-black/10 bg-white/85 backdrop-blur-xl dark:border-white/15 dark:bg-neutral-950/80",
        "transition-[opacity,translate,scale] duration-700 ease-out hover:scale-[1.03] hover:duration-200 motion-reduce:transition-opacity motion-reduce:hover:scale-100",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black dark:focus-visible:outline-white",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-black text-white dark:bg-white dark:text-neutral-900">
        <ArrowDown
          // Keyed to `visible` so it drops through once each time the cue appears.
          className={cn(
            "h-4 w-4 motion-reduce:animate-none",
            visible && "animate-drop",
          )}
          strokeWidth={2}
          aria-hidden="true"
        />
      </span>
    </button>
  );
};
export default ScrollCue;
