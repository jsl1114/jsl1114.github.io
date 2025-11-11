import { motion } from 'framer-motion'
import BottomNav from './ContactDock.jsx'
import { containerVariants, subtitleVariants, titleVariants,dockVariants } from '@/constants/variants.js'

const Contact = () => {

  return (
    <motion.div
      className='flex flex-wrap flex-col border-b border-neutral-300 dark:border-neutral-800 pt-10 justify-center items-center'
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.h1
        variants={titleVariants}
        className='text-4xl tracking-tight font-semibold text-center text-neutral-900 dark:text-white'
      >
        Contact
      </motion.h1>
      <motion.h2
        variants={subtitleVariants}
        className='text-md text-center text-neutral-600 dark:text-neutral-400'
      >
        Let's talk!
      </motion.h2>
      <motion.div
        variants={dockVariants}
        className='w-full px-2 rounded-xl flex flex-col items-center justify-center gap-4 mb-5'
      >
          <BottomNav />
      </motion.div>
    </motion.div>
  )
}
export default Contact