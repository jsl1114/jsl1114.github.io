import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import NewYearTypeWriter from "./HolidayTypeWriter";

const nameWords = ["Jason", "Liu"];

const wordVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.5 + i * 0.15,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const fadeUp = (delay) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  },
});

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);

  // Cursor-reactive bloom position (springy parallax).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bx = useSpring(mx, { stiffness: 60, damping: 20 });
  const by = useSpring(my, { stiffness: 60, damping: 20 });

  const handleMouseMove = (e) => {
    if (reduceMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // Offset from center, dampened.
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.15);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.15);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-[88vh] flex-col items-center justify-center pt-24 pb-10"
    >
      {/* Cursor-reactive bloom behind the name (dark mode) */}
      <motion.div
        style={{ x: bx, y: by }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hero-bloom pointer-events-none absolute inset-0 m-auto z-[-1] hidden h-[60vw] max-h-[600px] w-[60vw] max-w-[600px] rounded-full blur-2xl dark:block"
      />

      <div className="w-full text-center">
        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <NewYearTypeWriter />
        </motion.div>

        {/* Eyebrow kicker with availability dot */}
        <motion.div
          variants={fadeUp(0.35)}
          initial="hidden"
          animate="visible"
          className="mb-6 flex items-center justify-center gap-2 text-sm uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400"
        >
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-[#8900e1] opacity-75 ${reduceMotion ? "" : "animate-ping"}`} />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8900e1]" />
          </span>
          CS @ NYU · Full-Stack Developer
        </motion.div>

        {/* Oversized glowing name */}
        <h1
          className="text-glow mb-8 flex flex-wrap justify-center gap-x-6 font-bold leading-[0.95] tracking-tighter text-neutral-900 dark:text-white"
          style={{ fontSize: "clamp(3.5rem, 16vw, 11rem)" }}
        >
          {nameWords.map((word, i) => (
            <motion.span
              key={word}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={fadeUp(1.0)}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-2xl px-4 text-lg text-neutral-600 dark:text-neutral-400"
        >
          Hi, I'm Jason! I am a cs undergrad at{" "}
          <a href="https://nyu.edu" target="_blank" rel="noreferrer">
            New York University
          </a>
          . I love building things and solving problems. I enjoy Full-Stack
          Development, Multimodal Learning and NLP. When I am not coding, I am
          probably fishing, playing badminton or buying mechanical keyboards.
        </motion.p>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={reduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-6 rounded-full border border-neutral-400/60 dark:border-neutral-600 flex items-start justify-center p-1.5"
        >
          <span className="h-2 w-1 rounded-full bg-neutral-500 dark:bg-neutral-400" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
