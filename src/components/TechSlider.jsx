import { cn } from '@/lib/utils'
import { Marquee } from '@/components/magicui/marquee'

import { TECHNOLOGIES } from '@/constants/const'

const firstRow = TECHNOLOGIES.slice(0, TECHNOLOGIES.length / 2)
const secondRow = TECHNOLOGIES.slice(TECHNOLOGIES.length / 2)

const TechCard = ({ tech }) => {
  return (
    <figure
      className={cn(
        'relative h-30 w-30 cursor-pointer rounded-xl p-4'
        // 'border-gray-50/[.1] bg-gray-50/[.10] hover:bg-gray-50/[.15]'
      )}
    >
      <div className='flex flex-col items-center justify-center gap-2'>
        <img
          width='70'
          height='70'
          alt={tech}
          src={`https://cdn.simpleicons.org/${tech}/${tech}`}
        />
        <figcaption className='text-sm font-medium dark:text-white h-2 [text-transform:capitalize]'>
          {tech
            .replace('dot', '.')
            .replace('js', 'JS')
            .replace('sql', 'SQL')
            .replace('plusplus', '++')}
        </figcaption>
      </div>
    </figure>
  )
}

export default function TechSlider() {
  return (
    <div className='relative flex w-full lg:w-2/3 flex-col items-center justify-center overflow-x-hidden rounded-4xl pointer-events-none bg-white/[.2] border-3 border-white/[.2] shadow-neon-large'>
      <Marquee>
        {firstRow.map((tech, i) => (
          <TechCard
            key={i}
            tech={tech}
          />
        ))}
      </Marquee>
      <Marquee reverse>
        {secondRow.map((tech) => (
          <TechCard
            key={tech}
            tech={tech}
          />
        ))}
      </Marquee>
    </div>
  )
}
