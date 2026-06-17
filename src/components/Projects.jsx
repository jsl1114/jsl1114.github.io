import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ProjectCard from "./ProjectCard";
import CompactProjectCard from "./CompactProjectCard";
import { PROJECTS } from "@/constants/const";
import SectionHero from "./SectionHero";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

const featured = PROJECTS.filter((p) => !p.extended);
const extended = PROJECTS.filter((p) => p.extended);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const Projects = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-neutral-300 dark:border-neutral-800 pb-10"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <SectionHero title={"Projects"} subTitle={"Having Fun"} />

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto"
        variants={gridVariants}
      >
        {featured.map((p, i) => (
          <ProjectCard key={i} {...p} />
        ))}
      </motion.div>

      {extended.length > 0 && (
        <Collapsible
          open={open}
          onOpenChange={setOpen}
          className="max-w-5xl mx-auto mt-8"
        >
          <div className="flex justify-center">
            <CollapsibleTrigger className="flex items-center gap-2 rounded-full glass px-5 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent-light)] transition-colors cursor-pointer">
              {open ? "Show Less" : `More Projects (${extended.length})`}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              {extended.map((p, i) => (
                <CompactProjectCard key={i} {...p} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </motion.div>
  );
};

export default Projects;
