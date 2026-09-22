import { useState, useEffect, useContext, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ReactGA from "react-ga4";
import { Sun, Moon } from "lucide-react";
import CVIcon from "./CVIcon";
import Logo from "../assets/logo.svg";
import CV from "../assets/jason_liu_cv.pdf";
import { SECTIONS } from "../constants/const.js";
import { cn } from "@/lib/utils";
import { ThemeContext } from "./ThemeProvider";

// Hysteresis so a few pixels of trackpad jitter can't flip the bar back and forth
const COLLAPSE_AT = 24;
const EXPAND_AT = 8;

const CvLink = ({ compact }) => (
  <a
    href={CV}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() =>
      ReactGA.event({
        category: "Social",
        action: "cv_download",
        label: "CV - Navbar",
      })
    }
    className={cn(
      "transition-colors duration-300 ease-out text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white",
      compact ? "px-1.5 py-1" : "px-1",
    )}
    aria-label="Download CV"
  >
    <CVIcon size={compact ? 18 : 20} />
  </a>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navContainerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // The bar's width is the only thing that travels; the contents cross-dissolve
  const enter = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: "easeOut", delay: 0.06 };
  const leave = reduceMotion
    ? { duration: 0 }
    : { duration: 0.14, ease: "easeIn" };

  const themeToggle = (extraClass) => (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center rounded-full transition-colors duration-300 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:cursor-pointer",
        extraClass,
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );

  useEffect(() => {
    const checkScrollLock = () => {
      if (navContainerRef.current) {
        const bodyStyle = window.getComputedStyle(document.body);
        navContainerRef.current.style.paddingRight = bodyStyle.paddingRight;
      }
    };

    // Initial check
    checkScrollLock();

    const observer = new MutationObserver(checkScrollLock);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Cached so the scroll handler never forces a layout recalc
    let offsets = [];
    const measure = () => {
      offsets = SECTIONS.map((section) => {
        const element = document.getElementById(section.id);
        return { id: section.id, top: element ? element.offsetTop : Infinity };
      });
    };

    let ticking = false;

    const update = () => {
      ticking = false;
      const scrollY = window.scrollY;

      setIsScrolled((wasScrolled) =>
        wasScrolled ? scrollY > EXPAND_AT : scrollY > COLLAPSE_AT,
      );

      if (
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 5
      ) {
        setActiveSection(SECTIONS[SECTIONS.length - 1].id);
      } else {
        let currentSection = "";
        offsets.forEach((section) => {
          if (section.top <= scrollY + 100) {
            currentSection = section.id;
          }
        });
        setActiveSection(currentSection);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    measure();
    update();

    // Images and fonts settling in shift offsetTop, so re-measure when they do
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const handleSectionClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // The spy reports "" until the first measure lands; fall back to the top
  // section so the mobile readout stays hidden while at Home.
  const activeName =
    SECTIONS.find((s) => s.id === activeSection)?.name ?? SECTIONS[0].name;

  // Narrow screens have no room for the link row, so the centre carries just
  // the section you're in. Names swap bottom-to-top: the outgoing one rises
  // out of the clip while the incoming one rises into it.
  const sectionReadout = (
    <div className="relative h-5 w-full overflow-hidden lg:hidden">
      <AnimatePresence initial={false}>
        {activeName !== SECTIONS[0].name && (
          <motion.span
            key={activeName}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-110%", opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }
            }
            className="absolute inset-0 flex items-center justify-center text-[13px] font-medium tracking-[0.02em] text-neutral-900 dark:text-white"
          >
            {activeName}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  // Links belong to the collapsed bar only — at the top of the page the page
  // itself is the navigation. The cell stays mounted and fades so collapsing
  // doesn't shift the grid, and goes inert rather than unmounting so nothing
  // invisible stays tabbable. Never wrap this in a second AnimatePresence: one
  // fighting the popLayout swap below leaves the collapsed bar empty.
  const sectionLinks = (
    <div
      className={cn(
        "hidden lg:flex items-center justify-center gap-10 text-sm font-medium transition-opacity duration-300 ease-out motion-reduce:transition-none",
        isScrolled ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!isScrolled}
    >
      {SECTIONS.map((s) => (
        <div key={s.id} className="relative py-5">
          <button
            onClick={() => handleSectionClick(s.id)}
            tabIndex={isScrolled ? 0 : -1}
            className={cn(
              "transition-colors duration-300 cursor-pointer",
              activeSection === s.id
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white",
            )}
          >
            {s.name}
          </button>
          {activeSection === s.id && (
            <motion.div
              layoutId="nav-active-rule"
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.25, ease: "easeOut" }
              }
              className="absolute inset-x-0 bottom-3 h-px bg-neutral-900 dark:bg-white"
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={navContainerRef}
      className="fixed top-0 left-0 w-full flex justify-center items-center z-10 transition-[padding] duration-200"
    >
      <div className="w-[90%] max-w-[1280px] flex justify-center items-center">
        <nav
          className={cn(
            "mt-5 mb-10 grid grid-cols-[auto_1fr_auto] items-center -top-1 lg:top-0 rounded-full px-4 sm:px-8 py-0 relative overflow-hidden border border-transparent",
            "transition-[width,background-color,border-color] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            isScrolled
              ? "w-4/5 backdrop-blur-xl bg-white/85 dark:bg-neutral-950/80 border-black/10 dark:border-white/15"
              : "w-full",
          )}
        >
          <button
            onClick={() => handleSectionClick("hero")}
            className="my-4 flex shrink-0 cursor-pointer items-center"
            aria-label="Back to top"
          >
            <img
              className="mx-2 w-9 brightness-50 contrast-125 saturate-150 transition-all duration-300 sm:w-10 dark:brightness-100 dark:contrast-100 dark:saturate-100"
              src={Logo}
              alt="Jason Liu logo"
            />
          </button>

          <div className="flex min-w-0 items-center justify-center">
            {sectionReadout}
            {sectionLinks}
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            {isScrolled ? (
              <motion.div
                key="compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: leave }}
                transition={enter}
                className="flex items-center justify-end gap-1"
              >
                <CvLink compact />
                {themeToggle("ml-2")}
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: leave }}
                transition={enter}
                className="flex items-center justify-end gap-3"
              >
                <CvLink />
                {themeToggle("ml-1")}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </div>
  );
};
export default Navbar;
