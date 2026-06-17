import { useState } from "react";
import { FaLink, FaGithub } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import ReactGA from "react-ga4";
import { Expand } from "lucide-react";

// Compact, carousel-less card for projects without screenshots. Lives in the
// collapsible "More Projects" section: logo + title + short description + chips,
// laid out horizontally so the cards stay dense. Hovering (or tapping) the
// expander overlays the full description and all skills.
const CompactProjectCard = ({ title, desc, urls, image, technologies }) => {
  const [expanded, setExpanded] = useState(false);
  const logoSrc = new URL(`../assets/${image}`, import.meta.url).href;

  const links = (
    <div className="flex items-center gap-3 shrink-0">
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
          <FaLink className="w-4 h-4 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent-light)]" />
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
          <FaGithub className="w-4 h-4 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent-light)]" />
        </a>
      )}
    </div>
  );

  const logoBadge = (
    <img
      src={logoSrc}
      alt={`${title} logo`}
      loading="lazy"
      className="h-10 w-10 rounded-lg object-contain bg-white/70 dark:bg-white/10 p-1 shrink-0"
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full"
    >
      <div className="card rounded-xl p-4 flex gap-4 h-full relative overflow-hidden">
        {logoBadge}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h6 className="text-base font-semibold text-neutral-900 dark:text-white truncate min-w-0">
              {title}
            </h6>
            <div className="ml-auto flex items-center gap-3 shrink-0">
              {links}
              <button
                type="button"
                aria-label="Show full details"
                aria-expanded={expanded}
                onMouseEnter={() => setExpanded(true)}
                onFocus={() => setExpanded(true)}
                onClick={() => setExpanded((v) => !v)}
                className="grid place-items-center h-7 w-7 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent-light)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Expand className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
            {desc}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {technologies.map((tech, i) => (
              <span key={i} className="chip">
                {tech}
              </span>
            ))}
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
              className="absolute inset-0 z-10 flex flex-col p-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md"
            >
              <div className="flex items-center gap-2.5 mb-2">
                {logoBadge}
                <h6 className="text-base font-semibold text-neutral-900 dark:text-white">
                  {title}
                </h6>
                <div className="ml-auto">{links}</div>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                {desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, i) => (
                  <span key={i} className="chip">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CompactProjectCard;
