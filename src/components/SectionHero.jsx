import { subtitleVariants, titleVariants } from "@/constants/variants.js";
import { motion } from "framer-motion";

const SectionHero = ({ title, subTitle }) => {
  return (
    <div className="flex lg:justify-center items-end">
      <div className="w-full lg:w-1/4">
        <motion.h1
          variants={titleVariants}
          className={`tracking-[-0.025em] text-neutral-900 dark:text-white mt-10 text-5xl lg:text-6xl ${!subTitle && "mb-12"}`}
        >
          {title}
        </motion.h1>
        {subTitle && (
          <motion.h2
            variants={subtitleVariants}
            className="mb-8 mt-2 font-sans text-[18px] text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] max-w-none"
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
