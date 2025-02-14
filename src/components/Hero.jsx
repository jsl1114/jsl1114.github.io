const Hero = () => {
  return (
    <div className='border-b border-neutral-900 pb-4 lg:mb-35'>
      <div className='flex flex-wrap flex-col'>
        <div className='w-full text-center'>
          <h1 className='text-8xl mb-5'>Jason Liu</h1>
          <span className='text-4xl font-light bg-gradient-to-r from-slate-300 via-slate-500 to-slate-400 bg-clip-text text-transparent'>
            Full-Stack Developer
          </span>
          <p className='text-left lg:mx-50 py-10 text-slate-500'>
            Hi, I'm Jason. I am a cs undergrad at{' '}
            <a
              href='https://nyu.edu'
              target='_blank'
            >
              New York University
            </a>
            . I love building things and solving problems. I enjoy Full-Stack
            Development, Multimodal Learning and NLP. When I am not coding, I am
            probably fishing, playing badminton or buying mechanical keyboards.
          </p>
        </div>
      </div>
    </div>
  )
}
export default Hero
