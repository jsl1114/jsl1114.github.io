import { EXPERIENCE } from '@/constants/const'
import ExperienceCard from './ExperienceCard'
import { motion } from 'framer-motion'

const Experience = () => {
  return (
    <div className='flex flex-wrap flex-col border-b border-neutral-800 pb-4'>
      <motion.h1
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
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
    </div>
  )
}
export default Experience
