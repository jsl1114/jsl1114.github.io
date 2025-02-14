import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Education from './components/Education'
import Experience from './components/Experience'

function App() {
  return (
    <>
      <div className='absolute h-full w-full overflow-x-hidden text-neutral-300 antialiased selection:bg-cyan-300 selection:text-cyan-900 top-0 z-[-2] bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_60%_110%,rgba(87,6,140,0.5),rgba(0,0,0,0))]'>
        <Navbar />
        <div className='container mx-auto px-8'>
          <Hero />
          <Education />
          <Experience />
        </div>
      </div>
    </>
  )
}

export default App
