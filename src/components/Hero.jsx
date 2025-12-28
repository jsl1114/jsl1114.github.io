import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="pb-4 lg:mb-5 pt-35">
      <motion.div
        className="flex flex-wrap flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="w-full text-center">
          <h1 className="text-8xl font-bold tracking-tighter mb-5 text-neutral-900 dark:text-white">
            Jason Liu
          </h1>
          <span className="text-4xl font-light bg-gradient-to-r from-neutral-600 via-neutral-800 to-neutral-600 dark:from-neutral-300 dark:via-neutral-500 dark:to-neutral-400 bg-clip-text text-transparent">
            Full-Stack Developer
          </span>
          <p className="text-center lg:mx-50 py-10 text-neutral-600 dark:text-neutral-400">
            Hi, I'm Jason! I am a cs undergrad at{" "}
            <a href="https://nyu.edu" target="_blank">
              New York University
            </a>
            . I love building things and solving problems. I enjoy Full-Stack
            Development, Multimodal Learning and NLP. When I am not coding, I am
            probably fishing, playing badminton or buying mechanical keyboards.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default Hero;
