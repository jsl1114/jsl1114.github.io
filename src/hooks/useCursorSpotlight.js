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
