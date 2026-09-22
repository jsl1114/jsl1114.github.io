import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Education from "../components/Education";
import Experience from "../components/Experience";
import Technologies from "../components/Technologies";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import ScrollCue from "../components/ScrollCue";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <>
      <Navbar />
      <motion.div
        className="container mx-auto px-5 sm:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <section
          id="hero"
          className="flex min-h-svh flex-col justify-center border-b border-black/10 pt-[clamp(100px,11svh,112px)] pb-[clamp(56px,7svh,80px)] dark:border-white/[.08]"
        >
          <Hero />
          <Technologies />
          <ScrollCue targetId="experience" />
        </section>
        <section id="experience">
          <Experience />
        </section>
        <section id="projects">
          <Projects />
        </section>
        <section id="education">
          <Education />
        </section>
        <section id="contact">
          <Contact />
        </section>
        <Footer />
      </motion.div>
    </>
  );
};

export default Home;
