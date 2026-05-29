import ProjectCard from "./ProjectCard";
import { PROJECTS } from "@/constants/const";
import { motion } from "framer-motion";
import SectionHero from "./SectionHero";

const Projects = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="flex flex-wrap flex-col border-b border-neutral-300 dark:border-neutral-800 pt-10"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <SectionHero index={"03"} title={"Projects"} subTitle={"Having Fun"} />
      {PROJECTS.map((p, i) => {
        return <ProjectCard key={i} {...p} />;
      })}
    </motion.div>
  );
};
export default Projects;
