import { subtitleVariants, titleVariants } from '@/constants/variants.js'
import { motion } from 'framer-motion'

const SectionHero = ({title, subTitle}) => {
  return (
    <div className='flex lg:justify-center items-end'>
      <div className='w-full lg:w-1/4'>
      <motion.h1
          variants={titleVariants}
          className={`mt-10 tracking-tight font-semibold text-4xl text-neutral-900 dark:text-white ${!subTitle && "mb-12"}`}
        >
          {title}
        </motion.h1>
        {subTitle && (
          <motion.h2
            variants={subtitleVariants}
            className='mb-8 text-md text-neutral-600 dark:text-neutral-400 max-w-none'
          >
            {subTitle}
          </motion.h2>
        )}
      </div>
      <div className='w-full max-w-xl lg:w-3/4'>
      </div>
    </div>
  )
}
export default SectionHero