import { useState, useEffect } from "react";
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
} from "lucide-react";
import Logo from "../assets/logo.svg";
import CV from "../assets/jason_liu_cv.pdf";
import { SOCIALS, SECTIONS } from "../constants/const.js";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [navWidth, setNavWidth] = useState(100);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

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
          "mt-5 flex mb-10 items-center justify-between -top-1 lg:top-0 rounded-full px-4 py-0",
          isScrolled &&
            "backdrop-blur-xl box-shadow-lg bg-neutral-900/50 border border-white/10",
        )}
        style={{ width: `${navWidth}%` }}
      >
        <div className="flex flex-shrink-0 item-center my-4">
          <img className="mx-2 w-10" src={Logo} alt="Logo" />
        </div>
        {isScrolled && (
          <div className="flex items-center justify-center text-sm">
            {SECTIONS.map((s) => (
              <div className="relative flex flex-col items-center justify-center gap-0">
                <button
                  key={s.id}
                  onClick={() => handleSectionClick(s.id)}
                  className={cn(
                    "px-2 rounded-full transition-all duration-300 cursor-pointer flex flex-col items-center gap-1",
                    activeSection === s.id
                      ? "text-white"
                      : "text-neutral-400 hover:text-white",
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
                    activeSection === s.id ? "text-white" : "hidden",
                  )}
                />
              </div>
            ))}
          </div>
        )}
        <div
          className={cn(
            "flex items-center justify-center gap-4 text-2xl",
            isScrolled && "hidden",
          )}
        >
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.name === "CV" ? CV : s.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "transition-all duration-200 hover:text-violet-300",
              )}
            >
              {s.name === "LinkedIn" && <FaLinkedinIn />}
              {s.name === "GitHub" && <FiGithub />}
              {s.name === "Email" && <TbMail />}
              {s.name === "CV" && <FaRegFilePdf />}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
