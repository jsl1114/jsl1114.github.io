import { motion } from 'framer-motion'

const Hero = () => {
  return (
    <div className='pb-4 lg:mb-5'>
      <div className='flex flex-wrap flex-col'>
        <div className='w-full text-center'>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='text-8xl mb-5'
          >
            Jason Liu
          </motion.h1>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className='text-4xl font-light bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-400 bg-clip-text text-transparent'
          >
            Full-Stack Developer
          </motion.span>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className='text-left lg:mx-50 py-10 text-neutral-400'
          >
            Hi, I'm Jason! I am a cs undergrad at{' '}
            <a
              href='https://nyu.edu'
              target='_blank'
            >
              New York University
            </a>
            . I love building things and solving problems. I enjoy Full-Stack
            Development, Multimodal Learning and NLP. When I am not coding, I am
            probably fishing, playing badminton or buying mechanical keyboards.
          </motion.p>
        </div>
      </div>
    </div>
  )
}
export default Hero
