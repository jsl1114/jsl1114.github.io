import { EXPERIENCE } from '@/constants/const'
import ExperienceCard from './ExperienceCard'
import { motion } from 'framer-motion'

const Experience = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
      className='flex flex-wrap flex-col border-b border-neutral-800 pt-10'
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.h1
        variants={titleVariants}
        className='text-4xl text-center my-20'
      >
        Experience
      </motion.h1>
      <div>
        {EXPERIENCE.map((e, i) => (
          <ExperienceCard
            key={i}
            company={e.company}
            role={e.role}
            time={e.time}
            desc={e.desc}
            location={e.location}
            link={e.link}
          />
        ))}
      </div>
    </motion.div>
  )
}
export default Experience
