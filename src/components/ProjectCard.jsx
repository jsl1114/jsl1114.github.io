import { FaLink, FaGithub } from 'react-icons/fa6'
import { motion } from 'framer-motion'

const ProjectCard = ({ title, desc, urls, image, technologies }) => {
  const cardVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <motion.div
      variants={cardVariants}
      className='flex flex-wrap lg:justify-center mb-10'
    >
      <div className='w-full lg:w-1/4 pb-4'>
        <a href={urls.live ? urls.live : urls.github}>
          <div className='h-50 w-50 relative group cursor-pointer'>
            <img
              src={new URL(`../assets/${image}`, import.meta.url).href}
              alt={title}
              className='w-50 h-50 opacity-80 rounded-4xl pointer-events-none border-2 border-black/20 dark:border-white/[.2] bg-white dark:bg-white/[.2] shadow-neon-black dark:shadow-neon-white p-2 transition-transform duration-300'
            />

            <div className='absolute rounded-4xl inset-0 bg-purple-200/20 dark:bg-[#280D3D] bg-opacity-0 transition-opacity opacity-20 group-hover:opacity-0'></div>
          </div>
        </a>
      </div>
      <div className='w-full max-w-xl lg:w-3/4'>
        <h6 className='mb-2 font-semibold text-neutral-900 dark:text-white'>{title}</h6>
        <p className='text-sm text-neutral-700 dark:text-neutral-300 pb-4'>{desc}</p>
        <div className='flex flex-wrap pb-4'>
          {technologies.map((tech, i) => {
            return (
              <span
                key={i}
                className='px-2 py-1 mb-2 mr-2 bg-purple-100 dark:bg-[#280D3D] rounded text-purple-900 dark:text-neutral-300 text-sm font-medium transition-all duration-200 hover:bg-purple-200 dark:hover:bg-[#3a0f4d] cursor-default'
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
                <FaLink className='w-8 h-8 transition-all duration-200 hover:text-neutral-700/80 dark:hover:text-neutral-300/80 text-neutral-700 dark:text-neutral-300' />
              </a>
            </div>
          )}
          {urls.github && (
            <div className='w-8 h-8'>
              <a
                href={urls.github}
                target='_blank'
              >
                <FaGithub className='w-8 h-8 transition-all duration-200 hover:text-neutral-700/80 dark:hover:text-neutral-300/80 text-neutral-700 dark:text-neutral-300' />
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
export default ProjectCard
