import { EDUCATION } from '@/constants/const'
import EducationCard from './EducationCard'

const Education = () => {
  return (
    <div className='border-b border-neutral-900 pb-4'>
      <h1 className='my-20 text-4xl text-center'>Education</h1>
      <div>
        {EDUCATION.map((edu, i) => (
          <EducationCard
            school={edu.school}
            degree={edu.degree}
            year={edu.year}
            location={edu.location}
            gpa={edu.gpa}
            coursework={edu.coursework}
            key={i}
          />
        ))}
      </div>
    </div>
  )
}
export default Education
