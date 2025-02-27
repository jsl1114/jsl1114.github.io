import { EDUCATION } from '@/constants/const'
import EducationCard from './EducationCard'
import { motion } from 'framer-motion'

const Education = () => {
  return (
    <div className='border-b border-neutral-800 pb-4'>
      <motion.h1
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className='my-20 text-4xl text-center'
      >
        Education
      </motion.h1>
      <div className='px-2'>
        {EDUCATION.map((edu, i) => (
          <EducationCard
            {...edu}
            key={i}
          />
        ))}
      </div>
    </div>
  )
}
export default Education
