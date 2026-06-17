import { useState } from "react";
import { FaLink, FaGithub } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import ReactGA from "react-ga4";
import { Expand } from "lucide-react";
import ProjectCarousel from "./ProjectCarousel";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const MAX_CHIPS = 3;

const ProjectCard = ({
  title,
  desc,
  urls,
  image,
  screenshots = [],
  technologies,
}) => {
  const [expanded, setExpanded] = useState(false);
  const logoSrc = new URL(`../assets/${image}`, import.meta.url).href;
  const images = screenshots.map(
    (s) => new URL(`../assets/projects/${s}`, import.meta.url).href,
  );
  const shownTech = technologies.slice(0, MAX_CHIPS);
  const extra = technologies.length - shownTech.length;

  const header = (
    <div className="flex items-center gap-2.5 mb-2 shrink-0">
      <img
        src={logoSrc}
        alt={`${title} logo`}
        loading="lazy"
        className="h-8 w-8 rounded-lg object-contain bg-white/70 dark:bg-white/10 p-1 shrink-0"
      />
      <h6 className="text-lg font-semibold text-neutral-900 dark:text-white truncate min-w-0">
        {title}
      </h6>
    </div>
  );

  const links = (
    <div className="flex items-center gap-4">
      {urls.live && (
        <a
          href={urls.live}
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            ReactGA.event({
              category: "Projects",
              action: "live_link_click",
              label: title,
            })
          }
        >
          <FaLink className="w-5 h-5 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent-light)]" />
        </a>
      )}
      {urls.github && (
        <a
          href={urls.github}
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            ReactGA.event({
              category: "Projects",
              action: "github_link_click",
              label: title,
            })
          }
        >
          <FaGithub className="w-5 h-5 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent-light)]" />
        </a>
      )}
    </div>
  );

  return (
    <motion.div variants={cardVariants} className="h-full">
      <div className="card rounded-2xl overflow-hidden flex flex-col h-full relative">
        <ProjectCarousel images={images} title={title} />

        <div className="p-5 flex flex-col h-52 overflow-hidden">
          {header}
          <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 shrink-0">
            {desc}
          </p>
          <div className="flex flex-wrap gap-2 mt-3 max-h-8 overflow-hidden shrink-0">
            {shownTech.map((tech, i) => (
              <span key={i} className="chip">
                {tech}
              </span>
            ))}
            {extra > 0 && <span className="chip">+{extra}</span>}
          </div>
          <div className="flex items-center gap-4 mt-auto pt-3">
            {links}
            <button
              type="button"
              aria-label="Show full details"
              aria-expanded={expanded}
              onMouseEnter={() => setExpanded(true)}
              onFocus={() => setExpanded(true)}
              onClick={() => setExpanded((v) => !v)}
              className="ml-auto grid place-items-center h-8 w-8 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent-light)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Expand className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onMouseLeave={() => setExpanded(false)}
              className="absolute inset-0 z-10 flex flex-col p-5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md"
            >
              {header}
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
                {desc}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {technologies.map((tech, i) => (
                  <span key={i} className="chip">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-auto">{links}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
