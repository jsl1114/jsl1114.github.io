import { subtitleVariants, titleVariants } from "@/constants/variants.js";
import { motion } from "framer-motion";

const SectionHero = ({ title, subTitle, index }) => {
  return (
    <div className="flex lg:justify-center items-end">
      <div className="w-full lg:w-1/4">
        {index && (
          <motion.div
            variants={subtitleVariants}
            className="mb-2 flex items-center gap-3 font-mono text-sm tracking-widest text-nyu dark:text-purple-300"
          >
            {index}
            <span className="h-px w-10 bg-nyu/40 dark:bg-purple-300/40" />
          </motion.div>
        )}
        <motion.h1
          variants={titleVariants}
          className={`font-semibold tracking-tight text-neutral-900 dark:text-white ${
            index ? "mt-2 text-5xl lg:text-6xl" : "mt-10 text-4xl"
          } ${!subTitle && "mb-12"}`}
        >
          {title}
        </motion.h1>
        {subTitle && (
          <motion.h2
            variants={subtitleVariants}
            className="mb-8 mt-2 text-md text-neutral-600 dark:text-neutral-400 max-w-none"
          >
            {subTitle}
          </motion.h2>
        )}
      </div>
      <div className="w-full max-w-xl lg:w-3/4"></div>
    </div>
  );
};
export default SectionHero;
