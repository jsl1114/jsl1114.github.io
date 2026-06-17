import ProjectCard from "./ProjectCard";
import { PROJECTS } from "@/constants/const";
import { motion } from "framer-motion";
import SectionHero from "./SectionHero";

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
  return (
    <motion.div
      className="border-b border-neutral-300 dark:border-neutral-800 pt-10"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <SectionHero index={"03"} title={"Projects"} subTitle={"Having Fun"} />
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 mb-10"
        variants={gridVariants}
      >
        {PROJECTS.map((p, i) => {
          return <ProjectCard key={i} {...p} />;
        })}
      </motion.div>
    </motion.div>
  );
};
export default Projects;
