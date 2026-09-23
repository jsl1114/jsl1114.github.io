import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ProjectCard from "./ProjectCard";
import CompactProjectCard from "./CompactProjectCard";
import { PROJECTS } from "@/constants/const";
import SectionHero from "./SectionHero";
import { useHomeEntrance } from "@/hooks/useHomeEntrance";
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

const Projects = ({ open, onOpenChange }) => {
  const firstVisit = useHomeEntrance();
  // Cards already open when you come back from a project page shouldn't fade
  // in again; ones opened by the toggle still should.
  const [restoringOpen, setRestoringOpen] = useState(!firstVisit && open);
  return (
    <motion.div
      className="border-b border-black/10 dark:border-white/[.08] pb-10"
      variants={containerVariants}
      initial={firstVisit ? "hidden" : "visible"}
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
          onOpenChange={(next) => {
            setRestoringOpen(false);
            onOpenChange(next);
          }}
          className="max-w-5xl mx-auto mt-8"
        >
          <div className="flex justify-center">
            <CollapsibleTrigger className="pill pill-ghost">
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
                <CompactProjectCard key={i} {...p} skipEntrance={restoringOpen} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </motion.div>
  );
};

export default Projects;
