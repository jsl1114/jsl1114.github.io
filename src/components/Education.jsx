import { EDUCATION } from '@/constants/const'
import EducationCard from './EducationCard'
import { motion } from 'framer-motion'
import { containerVariants } from '@/constants/variants'
import SectionHero from './SectionHero'

const Education = () => {

  return (
    <motion.div
      className='border-b border-neutral-300 dark:border-neutral-800 pt-25'
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <SectionHero index={"01"} title={"Education"} subTitle={"Learning Stuff"} />
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
