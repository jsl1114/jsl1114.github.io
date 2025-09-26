import { motion } from 'framer-motion'
import { FaLinkedinIn } from 'react-icons/fa6'
import { FiGithub } from 'react-icons/fi'
import { TbMail } from 'react-icons/tb'
import { FaRegFilePdf } from 'react-icons/fa6'
import BottomNav from './ContactDock.jsx'

const Contact = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
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

  const subtitleVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const dockVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.5,
      },
    },
  }

  return (
    <motion.div
      className='flex flex-wrap flex-col border-b border-neutral-800 pt-10 justify-center items-center'
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.h1
        variants={titleVariants}
        className='text-4xl text-center'
      >
        Contact
      </motion.h1>
      <motion.h2
        variants={subtitleVariants}
        className='text-md text-center text-neutral-400'
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