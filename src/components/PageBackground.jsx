import { motion, useScroll, useTransform } from "framer-motion";

const PageBackground = () => {
  const { scrollYProgress } = useScroll();
  const topPos = useTransform(scrollYProgress, [0, 0.1], ["-20%", "-70%"]);

  return (
    <>
      {/* Light mode background color */}
      <div className="fixed inset-0 z-[-2] dark:hidden bg-[#fafafa]" />

      {/* Light mode animated background */}
      <div className="fixed inset-0 z-[-1] dark:hidden overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, 40, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-white shadow-[0_0_120px_rgba(0,0,0,0.03)]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-white shadow-[0_0_120px_rgba(0,0,0,0.03)]"
        />
      </div>

      {/* Dark mode background color */}
      <div className="fixed inset-0 z-[-2] hidden dark:block bg-neutral-950" />

      {/* Dark mode animated background */}
      <div className="fixed inset-0 z-[-1] hidden dark:block overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="absolute inset-0"
        >
          <motion.div
            style={{ top: topPos }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(87,7,140,0.8),transparent_70%)]"
          />
        </motion.div>
      </div>
    </>
  );
};

export default PageBackground;
