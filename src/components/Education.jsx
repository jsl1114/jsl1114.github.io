import { EDUCATION } from "@/constants/const";
import EducationCard from "./EducationCard";
import { motion } from "framer-motion";
import { useHomeEntrance } from "@/hooks/useHomeEntrance";
import { containerVariants } from "@/constants/variants";
import SectionHero from "./SectionHero";

const Education = () => {
  const firstVisit = useHomeEntrance();
  return (
    <motion.div
      className="border-b border-black/10 dark:border-white/[.08]"
      variants={containerVariants}
      initial={firstVisit ? "hidden" : "visible"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <SectionHero title={"Education"} subTitle={"Learning Stuff"} />
      <div className="px-2">
        {EDUCATION.map((edu, i) => (
          <EducationCard {...edu} key={i} />
        ))}
      </div>
    </motion.div>
  );
};
export default Education;
