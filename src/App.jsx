import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Education from './components/Education'
import Experience from './components/Experience'
import Technologies from './components/Technologies'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminMessages from './components/AdminMessages'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

function App() {
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle admin view with Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (showAdmin) {
    return (
      <div className='min-h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white p-8'>
        <button 
          onClick={() => setShowAdmin(false)}
          className='mb-8 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg hover:opacity-80'
        >
          ← Back to Site
        </button>
        <AdminMessages />
      </div>
    )
  }

  return (
    <>
      <div className='absolute min-h-full w-full overflow-x-hidden text-neutral-800 dark:text-neutral-300 antialiased selection:bg-cyan-300 selection:text-cyan-900 top-0 z-[-2] bg-white dark:bg-neutral-950 dark:bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(87,6,140,0.5),rgba(0,0,0,0))] flex justify-center items-center transition-colors duration-300'>
        {/* Light mode background pattern */}
        <div className='absolute inset-0 z-[-1] dark:hidden bg-[radial-gradient(circle_at_1px_1px,rgb(209_213_219)_1px,transparent_0)] [background-size:40px_40px]' />
        <div className='absolute inset-0 z-[-1] dark:hidden bg-gradient-to-br from-purple-50/40 via-transparent to-violet-50/40' />
        
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
