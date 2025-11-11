import { useState, useEffect, useContext } from "react";
import { FaLinkedinIn, FaRegFilePdf } from "react-icons/fa6";
import { FiGithub } from "react-icons/fi";
import { TbMail } from "react-icons/tb";
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
import Logo from "../assets/logo.svg";
import CV from "../assets/jason_liu_cv.pdf";
import { SOCIALS, SECTIONS } from "../constants/const.js";
import { cn } from "@/lib/utils";
import { ThemeContext } from "./ThemeProvider";
import { Separator } from "./ui/separator";

const Navbar = () => {
  const [navWidth, setNavWidth] = useState(100);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 500;
      const minWidth = 80;
      const maxWidth = 100;

      const scrollPercent = Math.min(scrollY / maxScroll, 1);
      const newWidth = maxWidth - (maxWidth - minWidth) * scrollPercent;

      setNavWidth(newWidth);
      setIsScrolled(scrollY > 20);

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5
      ) {
        setActiveSection(SECTIONS[SECTIONS.length - 1].id);
      } else {
        let currentSection = "";
        SECTIONS.forEach((section) => {
          const element = document.getElementById(section.id);
          if (element && element.offsetTop <= scrollY + 100) {
            currentSection = section.id;
          }
        });
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSectionClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-0 w-[90%] flex justify-center items-center z-10">
      <nav
        className={cn(
          "mt-5 flex mb-10 items-center justify-between -top-1 lg:top-0 rounded-full px-4 py-0 relative overflow-hidden transition-all duration-300",
          isScrolled &&
            "backdrop-blur-xl shadow-lg bg-white/90 dark:bg-neutral-900/80 border-2 border-neutral-300/60 dark:border-white/20",
        )}
        style={{ width: `${navWidth}%` }}
      >
        <div className="flex flex-shrink-0 items-center my-4">
          <img className="mx-2 w-10 brightness-50 dark:brightness-100 contrast-125 dark:contrast-100 saturate-150 dark:saturate-100 transition-all duration-300" src={Logo} alt="Logo" />
        </div>

        <div className={cn(
          "ml-6 flex items-center justify-center transition-all duration-500 ease-in-out absolute",
          isScrolled ? "left-16 gap-0" : "right-4 gap-4"
        )}>
          {!isScrolled && (
          <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center rounded-full transition-all duration-300 hover:text-violet-600 dark:hover:text-yellow-400 text-neutral-700 dark:text-neutral-300 ml-auto hover:cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
              )}
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.name === "CV" ? CV : s.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "transition-all duration-500 ease-in-out",
                isScrolled
                  ? "px-2 py-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                  : "px-0 py-0 text-2xl text-neutral-700 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-300"
              )}
            >
              {s.name === "LinkedIn" && <FaLinkedinIn size={24} />}
              {s.name === "GitHub" && <FiGithub size={24} />}
              {s.name === "Email" && <TbMail size={24} />}
              {s.name === "CV" && <FaRegFilePdf size={24} />}
            </a>
          ))}
        </div>

        {isScrolled && (
          <>
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center rounded-full transition-all duration-300 hover:text-violet-600 dark:hover:text-yellow-400 text-neutral-700 dark:text-neutral-300 ml-auto hover:cursor-pointer mr-3"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <div className="hidden sm:flex items-center justify-center text-sm">
              {SECTIONS.map((s) => (
                <div key={s.id} className="relative flex flex-col items-center justify-center gap-0">
                  <button
                    onClick={() => handleSectionClick(s.id)}
                    className={cn(
                      "px-2 rounded-full transition-all duration-300 cursor-pointer flex flex-col items-center gap-1",
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
                  <LucideDot
                    className={cn(
                      "absolute -bottom-5",
                      activeSection === s.id ? "text-neutral-900 dark:text-white" : "hidden",
                    )}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </nav>
    </div>
  );
};
export default Navbar;
