import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import ProjectCarousel from "./ProjectCarousel";
import ProjectLinks from "./ProjectLinks";

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
  slug,
  title,
  desc,
  urls,
  image,
  screenshots = [],
  technologies,
}) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const logoSrc = new URL(`../assets/${image}`, import.meta.url).href;
  const images = screenshots.map(
    (s) => new URL(`../assets/projects/${s}`, import.meta.url).href,
  );
  const shownTech = technologies.slice(0, MAX_CHIPS);
  const extra = technologies.length - shownTech.length;

  return (
    <motion.div variants={cardVariants} className="h-full">
      <article
        className="card group relative flex h-full flex-col overflow-hidden rounded-2xl focus-within:border-neutral-500"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
      >
        <ProjectCarousel
          images={images}
          title={title}
          paused={hovered || focused}
        />
        <div className="flex h-52 flex-col overflow-hidden p-5">
          <div className="mb-2 flex shrink-0 items-center gap-2.5">
            <img
              src={logoSrc}
              alt=""
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-lg bg-white/70 object-contain p-1 dark:bg-white/10"
            />
            <h3 className="min-w-0 truncate text-xl text-neutral-900 dark:text-white">
              <Link
                to={`/work/${slug}`}
                className="font-normal after:absolute after:inset-0 after:z-[5] focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-neutral-500"
              >
                {title}
              </Link>
            </h3>
          </div>
          <p className="line-clamp-2 shrink-0 text-sm leading-[1.625] text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            {desc}
          </p>
          <div className="mt-3 flex max-h-8 shrink-0 flex-wrap gap-2 overflow-hidden">
            {shownTech.map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
            {extra > 0 && <span className="chip">+{extra}</span>}
          </div>
          <div className="mt-auto flex items-center justify-between gap-4 pt-3">
            <ProjectLinks title={title} urls={urls} />
            <span
              className="flex items-center gap-1 text-xs text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]"
              aria-hidden="true"
            >
              View project <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </motion.div>
  );
};

export default ProjectCard;
