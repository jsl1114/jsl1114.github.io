import { motion } from 'framer-motion'

const EducationCard = ({ school, degree, year, location, gpa, coursework }) => {
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
      className='flex flex-wrap lg:justify-center mb-8'
    >
      <div className='w-full lg:w-1/4'>
        <p className='mb-2 text-sm text-neutral-500 dark:text-neutral-400'>{year}</p>
        <p className='mb-2 text-sm text-neutral-500 dark:text-neutral-400 italic'>{location}</p>
      </div>
      <div className='w-full max-w-xl lg:w-3/4'>
        <h6 className='mb-2 font-semibold text-neutral-900 dark:text-white'>
          {school} -{' '}
          <span className='italic text-sm text-nyu dark:text-purple-100'>{degree}</span>
        </h6>
        {gpa && <p className='text-neutral-700 dark:text-neutral-300'>GPA: {gpa}</p>}
        <div className='flex flex-wrap'>
          {coursework.map((w) => (
            <span
              className='mr-2 mt-4 rounded bg-purple-100 dark:bg-[#280D3D] text-purple-900 dark:text-neutral-300 px-2 py-1 text-sm font-medium transition-all duration-200 hover:bg-purple-200 dark:hover:bg-[#3a0f4d] cursor-default'
              key={w}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
export default EducationCard
