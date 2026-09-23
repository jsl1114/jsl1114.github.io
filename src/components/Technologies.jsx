import TechSlider from "../components/TechSlider";
import { motion } from "framer-motion";
import { useHomeEntrance } from "@/hooks/useHomeEntrance";

const Technologies = () => {
  const firstVisit = useHomeEntrance();
  return (
    <motion.div
      initial={firstVisit ? { opacity: 0, y: 30 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.95,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="mt-[clamp(16px,3svh,44px)] flex shrink-0 flex-wrap flex-col px-2 text-center"
    >
      {/* <h1 className='text-4xl text-center my-20'>Technologies</h1> */}
      <div className="flex flex-wrap justify-center items-center size-full">
        <TechSlider />
      </div>
    </motion.div>
  );
};
export default Technologies;
