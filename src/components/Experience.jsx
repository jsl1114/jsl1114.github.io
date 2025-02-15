import { EXPERIENCE } from '@/constants/const'
import ExperienceCard from './ExperienceCard'

const Experience = () => {
  return (
    <div className='flex flex-wrap flex-col border-b border-neutral-800 pb-4'>
      <h1 className='text-4xl text-center my-20'>Experience</h1>
      <div>
        {EXPERIENCE.map((e, i) => (
          <ExperienceCard
            key={i}
            company={e.company}
            role={e.role}
            time={e.time}
            desc={e.desc}
            location={e.location}
            link={e.link}
          />
        ))}
      </div>
    </div>
  )
}
export default Experience
