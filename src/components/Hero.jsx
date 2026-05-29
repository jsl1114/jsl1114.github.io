import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import NewYearTypeWriter from "./HolidayTypeWriter";

// The name, spelled out as mechanical keycaps. A null marks the gap between words.
const KEYS = ["J", "A", "S", "O", "N", null, "L", "I", "U"];

// Draggable bits of personality scattered around the name.
const HOBBIES = [
  { emoji: "🎣", label: "fishing", top: "12%", left: "8%", rotate: -12 },
  { emoji: "🏸", label: "badminton", top: "20%", right: "10%", rotate: 14 },
  { emoji: "⌨️", label: "mechanical keyboards", bottom: "24%", left: "14%", rotate: 8 },
  { emoji: "☕", label: "coffee", bottom: "18%", right: "16%", rotate: -8 },
];

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  // A short synthesized "thock" on keypress — no audio files, off by default.
  const playThock = () => {
    if (!soundOn) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio is a nicety; never let it break the page.
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden pt-24 pb-12"
    >
      {/* Draggable personality — fling them around. */}
      {HOBBIES.map((h) => (
        <motion.button
          key={h.label}
          type="button"
          title={`I like ${h.label} — drag me!`}
          aria-label={`${h.label} (draggable)`}
          drag
          dragConstraints={containerRef}
          dragElastic={0.5}
          dragMomentum={!reduceMotion}
          whileDrag={{ scale: 1.25, rotate: 0, cursor: "grabbing", zIndex: 20 }}
          whileHover={reduceMotion ? {} : { scale: 1.15 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: h.rotate }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.4 }}
          style={{ top: h.top, left: h.left, right: h.right, bottom: h.bottom }}
          className="absolute z-10 hidden cursor-grab select-none text-4xl drop-shadow-md active:cursor-grabbing sm:block md:text-5xl"
        >
          <span aria-hidden="true">{h.emoji}</span>
        </motion.button>
      ))}

      <div className="relative z-0 flex w-full flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <NewYearTypeWriter />
        </motion.div>

        {/* Name as pressable keycaps. Real <h1> for SR/SEO; caps are a visual layer. */}
        <h1 className="sr-only">Jason Liu</h1>
        <div
          aria-hidden="true"
          className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          {KEYS.map((key, i) =>
            key === null ? (
              <span key={`gap-${i}`} className="w-4 sm:w-8" />
            ) : (
              <Keycap
                key={`${key}-${i}`}
                char={key}
                index={i}
                reduceMotion={reduceMotion}
                onPress={playThock}
              />
            ),
          )}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mx-auto max-w-2xl px-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400"
        >
          Hi, I'm Jason! I am a cs undergrad at{" "}
          <a href="https://nyu.edu" target="_blank" rel="noreferrer">
            New York University
          </a>
          . I love building things and solving problems. I enjoy Full-Stack
          Development, Multimodal Learning and NLP. When I am not coding, I am
          probably fishing, playing badminton or buying mechanical keyboards.
        </motion.p>

        <motion.button
          type="button"
          onClick={() => setSoundOn((s) => !s)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Mute keycap sound" : "Enable keycap sound"}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-nyu/40 hover:text-nyu dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-purple-300/40 dark:hover:text-purple-300"
        >
          {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundOn ? "sound on — go type my name" : "click for keycap sound"}
        </motion.button>
      </div>
    </div>
  );
};

const Keycap = ({ char, index, reduceMotion, onPress }) => {
  const rest = {
    y: 0,
    boxShadow:
      "0 6px 0 0 rgb(163 163 163), 0 8px 6px 0 rgba(0,0,0,0.25)",
  };
  const pressed = {
    y: 6,
    boxShadow:
      "0 0px 0 0 rgb(163 163 163), 0 1px 2px 0 rgba(0,0,0,0.3)",
  };

  return (
    <motion.span
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, ...rest }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 24,
        delay: 0.3 + index * 0.05,
      }}
      whileHover={reduceMotion ? {} : { y: 2 }}
      whileTap={pressed}
      onTapStart={onPress}
      className="flex h-12 w-12 select-none items-center justify-center rounded-xl bg-gradient-to-b from-neutral-50 to-neutral-200 font-mono text-2xl font-bold text-neutral-800 sm:h-16 sm:w-16 sm:text-3xl md:h-20 md:w-20 md:text-4xl"
    >
      {char}
    </motion.span>
  );
};

export default Hero;
