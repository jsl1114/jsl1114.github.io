import { FaLink, FaGithub } from 'react-icons/fa6'

const ProjectCard = ({ title, desc, urls, image, technologies }) => {
  return (
    <div className='flex flex-wrap lg:justify-center mb-10'>
      <div className='w-full lg:w-1/4 pb-4'>
        <img
          src={new URL(`../assets/${image}`, import.meta.url).href}
          alt={title}
          className='w-50 h-50 opacity-80 rounded-4xl pointer-events-none border-2 border-white/[.2] bg-white/[.2] shadow-neon-white p-2'
        />
      </div>
      <div className='w-full max-w-xl lg:w-3/4'>
        <h6 className='mb-2 font-semibold'>{title}</h6>
        <p className='text-sm text-neutral-300 pb-4'>{desc}</p>
        <div className='flex flex-wrap pb-4'>
          {technologies.map((tech, i) => {
            return (
              <span
                key={i}
                className='px-2 py-1 mb-2 mr-2 bg-[#280D3D] rounded text-neutral-300 text-sm font-medium'
              >
                {tech}
              </span>
            )
          })}
        </div>
        <div className='flex flex-wrap gap-4'>
          {urls.live && (
            <div className='w-8 h-8'>
              <a
                href={urls.live}
                target='_blank'
              >
                <FaLink className='w-8 h-8' />
              </a>
            </div>
          )}
          {urls.github && (
            <div className='w-8 h-8'>
              <a
                href={urls.github}
                target='_blank'
              >
                <FaGithub className='w-8 h-8' />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default ProjectCard
