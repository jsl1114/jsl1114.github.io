import { FaLink, FaGithub } from "react-icons/fa6";
import { motion } from "framer-motion";
import ReactGA from "react-ga4";
import ProjectCarousel from "./ProjectCarousel";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const ProjectCard = ({
  title,
  desc,
  urls,
  image,
  screenshots = [],
  technologies,
}) => {
  const logoSrc = new URL(`../assets/${image}`, import.meta.url).href;
  const images = screenshots.map(
    (s) => new URL(`../assets/projects/${s}`, import.meta.url).href,
  );

  return (
    <motion.div variants={cardVariants} className="h-full">
      <div className="card rounded-2xl overflow-hidden flex flex-col h-full">
        <ProjectCarousel images={images} title={title} />
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <img
              src={logoSrc}
              alt={`${title} logo`}
              loading="lazy"
              className="h-8 w-8 rounded-lg object-contain bg-white/70 dark:bg-white/10 p-1 shrink-0"
            />
            <h6 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {title}
            </h6>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 pb-4">
            {desc}
          </p>
          <div className="flex flex-wrap gap-2 pb-4 mt-auto">
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
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
