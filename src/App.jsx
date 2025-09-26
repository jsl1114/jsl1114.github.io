import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Education from './components/Education'
import Experience from './components/Experience'
import Technologies from './components/Technologies'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { motion } from 'framer-motion'

function App() {
  return (
    <>
      <div className='absolute min-h-full w-full overflow-x-hidden text-neutral-300 antialiased selection:bg-cyan-300 selection:text-cyan-900 top-0 z-[-2] bg-neutral-950 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(87,6,140,0.5),rgba(0,0,0,0))] flex justify-center items-center'>
        <Navbar />
        <motion.div
          className='container mx-auto px-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <section id='hero'>
            <Hero />
            <Technologies />
          </section>
          <section id='education'>
            <Education />
          </section>
          <section id='experience'>
            <Experience />
          </section>
          <section id='projects'>
            <Projects />
          </section>
          <section id='contact'>
            <Contact />
          </section>
          <Footer />
        </motion.div>
      </div>
    </>
  )
}

export default App
