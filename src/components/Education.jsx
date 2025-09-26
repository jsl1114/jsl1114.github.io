import { EDUCATION } from '@/constants/const'
import EducationCard from './EducationCard'
import { motion } from 'framer-motion'

const Education = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <motion.div
      className='border-b border-neutral-800 pt-10'
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.h1
        variants={titleVariants}
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
    </motion.div>
  )
}
export default Education
