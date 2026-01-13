import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Education from "../components/Education";
import Experience from "../components/Experience";
import Technologies from "../components/Technologies";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <>
      <Navbar />
      <motion.div
        className="container mx-auto px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <section id="hero">
          <Hero />
          <Technologies />
        </section>
        <section id="education">
          <Education />
        </section>
        <section id="experience">
          <Experience />
        </section>
        <section id="projects">
          <Projects />
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
