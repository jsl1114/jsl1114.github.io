import { motion } from 'framer-motion'

const EducationCard = ({ school, degree, year, location, gpa, coursework }) => {
  return (
    <div className='flex flex-wrap lg:justify-center mb-8'>
      <motion.div
        viewport={{ once: true }}
        whileInView={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className='w-full lg:w-1/4'
      >
        <p className='mb-2 text-sm text-neutral-400'>{year}</p>
        <p className='mb-2 text-sm text-neutral-400 italic'>{location}</p>
      </motion.div>
      <motion.div
        viewport={{ once: true }}
        whileInView={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-xl lg:w-3/4'
      >
        <h6 className='mb-2 font-semibold'>
          {school} -{' '}
          <span className='italic text-sm text-purple-100'>{degree}</span>
        </h6>
        {gpa && <p>GPA: {gpa}</p>}
        <div className='flex flex-wrap'>
          {coursework.map((w) => (
            <span
              className='mr-2 mt-4 rounded bg-[#280D3D] text-neutral-300 px-2 py-1 text-sm font-medium'
              key={w}
            >
              {w}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
export default EducationCard
