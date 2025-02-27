import TechSlider from '../components/TechSlider'
import { motion } from 'framer-motion'

const Technologies = () => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className='flex flex-wrap flex-col px-2 text-center border-b border-neutral-800 pb-20'
    >
      {/* <h1 className='text-4xl text-center my-20'>Technologies</h1> */}
      <div className='flex flex-wrap justify-center items-center size-full'>
        <TechSlider />
      </div>
    </motion.div>
  )
}
export default Technologies
