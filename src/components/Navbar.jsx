import { useState, useEffect, useContext, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FaLinkedinIn } from "react-icons/fa6";
import { FiGithub } from "react-icons/fi";
import { TbMail } from "react-icons/tb";
import ReactGA from "react-ga4";
import {
  House,
  GraduationCap,
  Briefcase,
  Folder,
  ContactRound,
  LucideDot,
  Sun,
  Moon,
} from "lucide-react";
import CVIcon from "./CVIcon";
import Logo from "../assets/logo.svg";
import CV from "../assets/jason_liu_cv.pdf";
import { SOCIALS, SECTIONS } from "../constants/const.js";
import { cn } from "@/lib/utils";
import { ThemeContext } from "./ThemeProvider";
import NewYearTypeWriter from "./HolidayTypeWriter";

// Hysteresis so a few pixels of trackpad jitter can't flip the bar back and forth
const COLLAPSE_AT = 24;
const EXPAND_AT = 8;
// Ignore tiny scroll wobble when deciding direction (mobile theme toggler)
const DIRECTION_THRESHOLD = 6;

const SocialLinks = ({ compact }) =>
  SOCIALS.map((s) => (
    <a
      key={s.name}
      href={s.name === "CV" ? CV : s.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        ReactGA.event({
          category: "Social",
          action:
            s.name === "CV"
              ? "cv_download"
              : s.name === "Email"
                ? "email_click"
                : s.name === "LinkedIn"
                  ? "LinkedIn"
                  : "GitHub",
          label: `${s.name} - Navbar`,
        })
      }
      className={cn(
        "transition-colors duration-300 ease-out",
        compact
          ? "px-2 py-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          : "text-2xl text-neutral-700 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-300",
      )}
    >
      {s.name === "LinkedIn" && <FaLinkedinIn size={24} />}
      {s.name === "GitHub" && <FiGithub size={24} />}
      {s.name === "Email" && <TbMail size={24} />}
      {s.name === "CV" && <CVIcon size={24} />}
    </a>
  ));

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isScrollUp, setIsScrollUp] = useState(true);
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
        "hidden sm:flex items-center justify-center rounded-full transition-colors duration-300 hover:text-violet-600 dark:hover:text-yellow-400 text-neutral-700 dark:text-neutral-300 hover:cursor-pointer",
        extraClass,
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
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

    let lastDirectionY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastDirectionY) > DIRECTION_THRESHOLD) {
        setIsScrollUp(scrollY < lastDirectionY);
        lastDirectionY = scrollY;
      }

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

  return (
    <>
      <div
        ref={navContainerRef}
        className="fixed top-0 left-0 w-full flex justify-center items-center z-10 transition-[padding] duration-200"
      >
        <div className="w-[90%] flex justify-center items-center">
          <nav
            className={cn(
              "mt-5 flex mb-10 items-center -top-1 lg:top-0 rounded-full px-4 py-0 relative overflow-hidden border-2 border-transparent",
              "transition-[width,background-color,border-color,box-shadow] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              isScrolled
                ? "w-4/5 backdrop-blur-xl shadow-lg bg-white/90 dark:bg-neutral-900/80 border-neutral-300/60 dark:border-white/20"
                : "w-full",
            )}
          >
            <div className="flex flex-shrink-0 items-center my-4">
              <img
                className="mx-2 w-10 brightness-50 dark:brightness-100 contrast-125 dark:contrast-100 saturate-150 dark:saturate-100 transition-all duration-300"
                src={Logo}
                alt="Logo"
              />
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {isScrolled ? (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: leave }}
                  transition={enter}
                  className="flex flex-1 items-center"
                >
                  <div className="flex items-center ml-2">
                    <SocialLinks compact />
                  </div>

                  {themeToggle("ml-auto mr-3")}

                  <div className="hidden sm:flex items-center justify-center text-sm">
                    {SECTIONS.map((s) => (
                      <div
                        key={s.id}
                        className="relative flex flex-col items-center justify-center gap-0"
                      >
                        <button
                          onClick={() => handleSectionClick(s.id)}
                          className={cn(
                            "px-2 rounded-full transition-colors duration-300 cursor-pointer flex flex-col items-center gap-1",
                            activeSection === s.id
                              ? "text-neutral-900 dark:text-white"
                              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white",
                          )}
                        >
                          {s.name === "Home" && <House />}
                          {s.name === "Education" && <GraduationCap />}
                          {s.name === "Experience" && <Briefcase />}
                          {s.name === "Projects" && <Folder />}
                          {s.name === "Contact" && <ContactRound />}
                          {/* {s.name} */}
                        </button>
                        {activeSection === s.id && (
                          <motion.div
                            layoutId="nav-active-dot"
                            transition={
                              reduceMotion
                                ? { duration: 0 }
                                : { duration: 0.25, ease: "easeOut" }
                            }
                            className="absolute -bottom-5"
                          >
                            <LucideDot className="text-neutral-900 dark:text-white" />
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: leave }}
                  transition={enter}
                  className="flex flex-1 items-center justify-end gap-4"
                >
                  {themeToggle()}
                  <SocialLinks />
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      </div>

      {/* Mobile-only floating theme toggler (bottom-right) */}
      <button
        onClick={toggleTheme}
        className={cn(
          "fixed bottom-4 right-4 z-20 flex items-center justify-center rounded-full border border-neutral-300/70 bg-white/90 text-neutral-700 shadow-lg backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:text-violet-600 dark:border-white/20 dark:bg-neutral-900/90 dark:text-neutral-200 dark:hover:text-yellow-400 sm:hidden",
          isScrollUp
            ? "h-11 w-11 opacity-100 scale-100"
            : "h-3 w-3 opacity-70 scale-75",
        )}
        aria-label="Toggle theme"
      >
        {isScrollUp &&
          (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
      </button>
    </>
  );
};
export default Navbar;
