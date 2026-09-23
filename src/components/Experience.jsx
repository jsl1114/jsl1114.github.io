import { EXPERIENCE } from "@/constants/const";
import ExperienceCard from "./ExperienceCard";
import { motion } from "framer-motion";
import { useHomeEntrance } from "@/hooks/useHomeEntrance";
import SectionHero from "./SectionHero";

const Experience = () => {
  const firstVisit = useHomeEntrance();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="flex flex-wrap flex-col border-b border-black/10 dark:border-white/[.08]"
      variants={containerVariants}
      initial={firstVisit ? "hidden" : "visible"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <SectionHero title={"Experience"} subTitle={"Doing Work"} />
      <div>
        {EXPERIENCE.map((e, i) => (
          <ExperienceCard
            key={i}
            company={e.company}
            role={e.role}
            time={e.time}
            desc={e.desc}
            location={e.location}
            link={e.link}
            additionalInfo={e.additionalInfo}
          />
        ))}
      </div>
    </motion.div>
  );
};
export default Experience;
