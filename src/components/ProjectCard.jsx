import { FaLink, FaGithub } from 'react-icons/fa6'
import { motion } from 'framer-motion'

const ProjectCard = ({ title, desc, urls, image, technologies }) => {
  return (
    <div className='flex flex-wrap lg:justify-center mb-10'>
      <motion.div
        viewport={{ once: true }}
        whileInView={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className='w-full lg:w-1/4 pb-4'
      >
        <a href={urls.live ? urls.live : urls.github}>
          <div className='h-50 w-50 relative group cursor-pointer'>
            <img
              src={new URL(`../assets/${image}`, import.meta.url).href}
              alt={title}
              className='w-50 h-50 opacity-80 rounded-4xl pointer-events-none border-2 border-white/[.2] bg-white/[.2] shadow-neon-white p-2'
            />

            <div className='absolute rounded-4xl inset-0 bg-[#280D3D] bg-opacity-0 transition-opacity opacity-20 group-hover:opacity-0'></div>
          </div>
        </a>
      </motion.div>
      <motion.div
        viewport={{ once: true }}
        whileInView={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-xl lg:w-3/4'
      >
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
      </motion.div>
    </div>
  )
}
export default ProjectCard
