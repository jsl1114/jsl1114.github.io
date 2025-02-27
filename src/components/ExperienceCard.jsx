import { MdArrowOutward } from 'react-icons/md'
import { motion } from 'framer-motion'

const ExperienceCard = ({ time, company, desc, role, location, link }) => {
  return (
    <div className='flex flex-wrap lg:justify-center mb-8'>
      <motion.div
        viewport={{ once: true }}
        whileInView={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className='w-full lg:w-1/4 pt-4 px-2'
      >
        <p className='mb-2 text-sm text-neutral-400'>{time}</p>
        <p className='mb-2 text-sm text-neutral-400 italic'>{location}</p>
      </motion.div>

      <motion.div
        viewport={{ once: true }}
        whileInView={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-xl lg:w-3/4 card py-4 px-2 rounded-xl group'
      >
        <a
          href={link}
          target='_blank'
          className='rounded'
        >
          <h6 className='mb-2 font-semibold flex flex-wrap items-center'>
            {role} -{' '}
            <span className='ml-1 italic text-sm text-purple-100'>
              {company}
            </span>
            <MdArrowOutward className='ml-1 link-symbol' />
          </h6>
          <ul className='pl-2'>
            {desc.map((w, i) => (
              <li
                className='mt-2 rounded text-neutral-300 text-sm font-medium'
                key={i}
              >
                {w}
              </li>
            ))}
          </ul>
        </a>
      </motion.div>
    </div>
  )
}
export default ExperienceCard
