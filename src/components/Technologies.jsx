import TechSlider from "../components/TechSlider";
import { motion } from "framer-motion";

const Technologies = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="flex flex-wrap flex-col px-2 text-center border-b border-neutral-300 dark:border-neutral-800 pb-20"
    >
      {/* <h1 className='text-4xl text-center my-20'>Technologies</h1> */}
      <div className="flex flex-wrap justify-center items-center size-full">
        <TechSlider />
      </div>
    </motion.div>
  );
};
export default Technologies;
