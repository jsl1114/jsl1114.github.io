import { MdArrowOutward, MdOpenInFull } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { Dialog, DialogClose, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Expand } from 'lucide-react'

const ExperienceCard = ({ time, company, desc, role, location, link, additionalInfo }) => {
  const [isOpen, setIsOpen] = useState(false)

  const cardVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <motion.div
      variants={cardVariants}
      className='flex flex-wrap lg:justify-center mb-8'
    >
      <div className='w-full lg:w-1/4 pt-4 px-2'>
        <p className='mb-2 text-sm text-neutral-500 dark:text-neutral-400'>{time}</p>
        <p className='mb-2 text-sm text-neutral-500 dark:text-neutral-400 italic'>{location}</p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div
            role='button'
            tabIndex={0}
            aria-expanded={isOpen}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsOpen(true)
              }
            }}
            className='w-full max-w-xl lg:w-3/4 card py-4 px-2 rounded-xl group cursor-pointer outline-none relative hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors duration-300 dark:border dark:border-neutral-800'
          >
            <div className='mb-2 font-semibold text-neutral-900 dark:text-white sm:justify-between sm:flex'>
              {role}
              <br className='block sm:hidden' />
              <span className='hidden sm:inline'> </span>
              <span className='inline-flex items-center'>
                <a
                  href={link}
                  target='_blank'
                  rel='noreferrer'
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className='text-sm !text-nyu dark:!text-purple-100 !font-normal'
                >
                  {company}
                </a>
              </span>
            </div>

            <ul className='pl-4 list-disc'>
              {desc.map((w, i) => (
                <li
                  className='mt-2 rounded text-neutral-700 dark:text-neutral-300 text-sm font-medium'
                  key={i}
                >
                  {w}
                </li>
              ))}
            </ul>
            <Expand className='absolute bottom-2 right-2 text-neutral-400 opacity-40 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100' size={16}/>
          </motion.div>
        </DialogTrigger>

        <AnimatePresence>
          {isOpen && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-50 bg-neutral-900/40 dark:bg-black/50 backdrop-blur-md"
                />
              </DialogPrimitive.Overlay>
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <DialogPrimitive.Content asChild forceMount>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    className="w-[min(700px,calc(100vw-2rem))] max-h-[85vh] pointer-events-auto outline-none rounded-xl border border-nyu/[.2] bg-white dark:bg-neutral-900 shadow-lg overflow-y-auto"
                  >
                    <div className="w-full h-full overflow-y-auto p-6 sm:p-10">
                      <div className='flex items-start justify-between gap-6 mb-8'>
                        <div className='min-w-0 flex-1'>
                          <div className='text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3'>
                            Experience
                          </div>
                          <h2 className='text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3'>
                            {role}
                          </h2>
                          <a
                              href={link}
                              target='_blank'
                              rel='noreferrer'
                              className='inline-flex items-center hover:text-nyu dark:hover:text-purple-300 transition-colors font-medium text-xl'
                            >
                              {company}
                              <MdArrowOutward className='ml-1' />
                          </a>
                          <div className='flex flex-wrap items-center gap-x-2 gap-y-2 text-lg font-medium text-neutral-600 dark:text-neutral-300'>
                            <span className='text-neutral-500 dark:text-neutral-400'>{time}</span>
                            {location && (
                              <>
                                <span className='hidden sm:inline text-neutral-300 dark:text-neutral-600'>•</span>
                                <span className='text-neutral-500 dark:text-neutral-400'>{location}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <DialogClose asChild>
                          <button
                            type='button'
                            className='p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 hover:cursor-pointer dark:hover:bg-neutral-700 transition-colors'
                          >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </DialogClose>
                      </div>

                      <div className='space-y-4 mb-8'>
                        {desc.map((w, i) => (
                          <p key={i} className='text-md leading-relaxed text-neutral-700 dark:text-neutral-300'>
                            {w}
                          </p>
                        ))}
                      </div>


                      <div className='grid gap-6'>
                        {additionalInfo && additionalInfo.map((section, idx) => (
                          <div key={idx}>
                            <div className='text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3'>
                              {section.title}
                            </div>
                            <ul className='space-y-2'>
                              {section.content.map((item, i) => (
                                <li
                                  key={i}
                                  className='text-base font-medium text-neutral-700 dark:text-neutral-300 flex items-start'
                                >
                                  <span className="mr-2 text-nyu dark:text-purple-400">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </DialogPrimitive.Content>
              </div>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </Dialog>
    </motion.div>
  )
}
export default ExperienceCard
