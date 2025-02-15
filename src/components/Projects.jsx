import ProjectCard from './ProjectCard'
import { PROJECTS } from '@/constants/const'

const Projects = () => {
  return (
    <div className='flex flex-wrap flex-col border-b border-neutral-800 pb-4'>
      <h1 className='text-4xl text-center my-20'>Projects</h1>
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
