import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// The landing view fills the screen, so this is the only hint that there is
// more below. It fades out while scrolled away from the top.
const ScrollCue = ({ targetId }) => {
  const [atTop, setAtTop] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Wait for the entry curtain and the staggered hero copy to settle.
    const timer = window.setTimeout(() => setRevealed(true), 1400);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

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
        "fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-1 text-[var(--color-muted)] transition-opacity duration-700 hover:text-black sm:bottom-6 dark:text-[var(--color-muted-dark)] dark:hover:text-white",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <span className="text-[10px] font-medium tracking-[0.14em] uppercase">
        Scroll
      </span>
      <ChevronDown className="h-4 w-4 animate-bob motion-reduce:animate-none" />
    </button>
  );
};
export default ScrollCue;
