import { cn } from '@/lib/utils'
import { Marquee } from '@/components/magicui/marquee'

import { TECHNOLOGIES } from '@/constants/const'

const firstRow = TECHNOLOGIES.slice(0, TECHNOLOGIES.length / 2)
const secondRow = TECHNOLOGIES.slice(TECHNOLOGIES.length / 2)

const TechCard = ({ tech }) => {
  return (
    <figure
      className={cn(
        'relative h-[clamp(56px,8svh,72px)] w-[clamp(56px,8svh,72px)] cursor-pointer rounded-xl p-1.5 transition-transform duration-300 hover:scale-110 hover:-translate-y-2 sm:h-24 sm:w-24 sm:p-3 lg:h-[clamp(88px,13svh,120px)] lg:w-[clamp(88px,13svh,120px)] lg:p-4'
        // 'border-gray-50/[.1] bg-gray-50/[.10] hover:bg-gray-50/[.15]'
      )}
    >
      <div className='flex flex-col items-center justify-center gap-2'>
        <img
          width='70'
          height='70'
          alt={tech}
          className='h-auto w-[clamp(28px,4.5svh,36px)] sm:w-12 lg:w-[clamp(46px,8svh,70px)]'
          src={`https://cdn.simpleicons.org/${tech}/${tech}`}
        />
        <figcaption className='font-sans text-[10px] font-medium text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] h-2 [text-transform:capitalize] sm:text-xs lg:text-sm'>
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
    <div className='relative flex w-full lg:w-2/3 flex-col items-center justify-center overflow-x-hidden rounded-4xl pointer-events-none bg-white/70 dark:bg-white/[.04] backdrop-blur-md border border-black/10 dark:border-white/[.08]'>
      <Marquee pauseOnHover className='p-1 sm:p-2'>
        {firstRow.map((tech, i) => (
          <TechCard
            key={i}
            tech={tech}
          />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className='p-1 sm:p-2'>
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
