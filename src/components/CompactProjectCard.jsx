import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import ProjectLinks from "./ProjectLinks";

const CompactProjectCard = ({
  slug,
  title,
  desc,
  urls,
  image,
  technologies,
  skipEntrance,
}) => {
  const logoSrc = new URL(`../assets/${image}`, import.meta.url).href;

  return (
    <motion.div
      initial={skipEntrance ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <article className="card relative flex h-full gap-4 overflow-hidden rounded-xl p-4 focus-within:border-neutral-500">
        <img
          src={logoSrc}
          alt=""
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-lg bg-white/70 object-contain p-1 dark:bg-white/10"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1 flex items-center justify-between gap-3">
            <h3 className="min-w-0 truncate text-lg text-neutral-900 dark:text-white">
              <Link
                to={`/work/${slug}`}
                className="font-normal after:absolute after:inset-0 after:z-[5] focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-neutral-500"
              >
                {title}
              </Link>
            </h3>
            <ProjectLinks title={title} urls={urls} />
          </div>
          <p className="line-clamp-2 text-sm leading-[1.625] text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
            {desc}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
          </div>
          <span
            className="mt-4 flex items-center gap-1 text-xs text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]"
            aria-hidden="true"
          >
            View project <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </article>
    </motion.div>
  );
};

export default CompactProjectCard;
