import { useState } from "react";
import { FaLink, FaGithub } from "react-icons/fa6";
import { motion } from "framer-motion";
import ReactGA from "react-ga4";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const ProjectCard = ({ title, desc, urls, image, screenshot, technologies }) => {
  const [imgError, setImgError] = useState(false);
  const href = urls.live || urls.github;
  const logoSrc = new URL(`../assets/${image}`, import.meta.url).href;
  const screenshotSrc = screenshot
    ? new URL(`../assets/projects/${screenshot}`, import.meta.url).href
    : null;
  const showScreenshot = screenshotSrc && !imgError;

  return (
    <motion.div variants={cardVariants} className="mb-8 w-full max-w-3xl mx-auto">
      <div className="card rounded-2xl overflow-hidden group">
        <a href={href} target="_blank" rel="noreferrer" className="block">
          <div className="relative aspect-[16/10] flex items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]">
            {showScreenshot ? (
              <img
                src={screenshotSrc}
                alt={`${title} screenshot`}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <img
                src={logoSrc}
                alt={title}
                loading="lazy"
                className="max-h-2/3 max-w-1/2 object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
        </a>
        <div className="p-6">
          <h6 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h6>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 pb-4">
            {desc}
          </p>
          <div className="flex flex-wrap gap-2 pb-4">
            {technologies.map((tech, i) => (
              <span key={i} className="chip">
                {tech}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
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
                <FaLink className="w-6 h-6 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent-light)]" />
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
                <FaGithub className="w-6 h-6 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent-light)]" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
