import { EDUCATION } from '@/constants/const'
import EducationCard from './EducationCard'

const Education = () => {
  return (
    <div className='border-b border-neutral-800 pb-4'>
      <h1 className='my-20 text-4xl text-center'>Education</h1>
      <div className='px-2'>
        {EDUCATION.map((edu, i) => (
          <EducationCard
            {...edu}
            key={i}
          />
        ))}
      </div>
    </div>
  )
}
export default Education
