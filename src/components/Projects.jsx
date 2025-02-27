import ProjectCard from './ProjectCard'
import { PROJECTS } from '@/constants/const'
import { motion } from 'framer-motion'

const Projects = () => {
  return (
    <div className='flex flex-wrap flex-col border-b border-neutral-800 pb-4'>
      <motion.h1
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className='text-4xl text-center my-20'
      >
        Projects
      </motion.h1>
      {PROJECTS.map((p, i) => {
        return (
          <ProjectCard
            key={i}
            {...p}
          />
        )
      })}
    </div>
  )
}
export default Projects
