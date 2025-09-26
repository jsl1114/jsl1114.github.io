import { motion } from 'framer-motion'

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth animation
      },
    },
  }

  const nameVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    glow: {
      textShadow: [
        '0 0 5px rgba(255,255,255,0.5)',
        '0 0 10px rgba(255,255,255,0.8)',
        '0 0 15px rgba(255,255,255,0.5)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  }

  return (
    <div className='pb-4 lg:mb-5 pt-35'>
      <motion.div
        className='flex flex-wrap flex-col'
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className='w-full text-center'>
          <motion.h1
            variants={nameVariants}
            animate='glow'
            className='text-8xl mb-5'
          >
            Jason Liu
          </motion.h1>
          <motion.span
            variants={itemVariants}
            className='text-4xl font-light bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-400 bg-clip-text text-transparent'
          >
            Full-Stack Developer
          </motion.span>
          <motion.p
            variants={itemVariants}
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
      </motion.div>
    </div>
  )
}
export default Hero
