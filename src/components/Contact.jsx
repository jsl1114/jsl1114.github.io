import { motion } from 'framer-motion'
import { FaLinkedinIn } from 'react-icons/fa6'
import { FiGithub } from 'react-icons/fi'
import { TbMail } from 'react-icons/tb'
import { FaRegFilePdf } from 'react-icons/fa6'
import BottomNav from './ContactDock.jsx'

const Contact = () => {
  const items = [
    {icon: <FaLinkedinIn />, link: 'https://www.linkedin.com/in/jinsen-liu/', label: 'LinkedIn'},
    {icon: <FiGithub />, link: 'https://github.com/jsl1114', label: 'GitHub'},
    {icon: <TbMail />, link: 'mailto:jl13869@nyu.edu', label: 'Email'},
    {icon: <FaRegFilePdf />, link: '../assets/cv_english.pdf', label: 'CV'},
  ]
  
  return (
    <div className='flex flex-wrap flex-col border-b border-neutral-800 pt-10 justify-center items-center'>
      <motion.h1
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className='text-4xl text-center'
      >
        Contact
      </motion.h1>
      <motion.h2
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className='text-md text-center text-neutral-400'
      >
        Let's talk!
      </motion.h2>
      <motion.div
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        initial={{ opacity: 0, y: 50, scale: 0.5 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
        className='w-full px-2 rounded-xl flex flex-col items-center justify-center gap-4 mb-5'
      >
          <BottomNav />
      </motion.div>
    </div>
  )
}
export default Contact