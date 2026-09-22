import { MdArrowOutward, MdOpenInFull } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Expand } from "lucide-react";

const ExperienceCard = ({
  time,
  company,
  desc,
  role,
  location,
  link,
  additionalInfo,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
  };

  return (
    <motion.div
      variants={cardVariants}
      className="flex flex-wrap lg:justify-center mb-8"
    >
      <div className="w-full lg:w-1/4 pt-4 px-2">
        <p className="mb-2 text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
          {time}
        </p>
        <p className="mb-2 text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] italic">
          {location}
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
            className="w-full max-w-xl lg:w-3/4 card py-5 px-4 rounded-xl group cursor-pointer outline-none relative hover:bg-white/90 dark:hover:bg-white/[.07] transition-colors duration-300"
          >
            <div className="mb-2 font-display text-xl leading-tight text-neutral-900 dark:text-white sm:justify-between sm:flex sm:items-baseline">
              {role}
              <br className="block sm:hidden" />
              <span className="hidden sm:inline"> </span>
              <span className="inline-flex items-center">
                <div className="font-sans text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] font-normal">
                  {company}
                </div>
              </span>
            </div>

            <ul className="pl-4 list-disc">
              {desc.map((w, i) => (
                <li
                  className="mt-2 rounded text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] text-sm leading-[1.625]"
                  key={i}
                >
                  {w}
                </li>
              ))}
            </ul>
            <Expand
              className="absolute bottom-2 right-2 text-neutral-400 opacity-40 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100"
              size={16}
            />
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
                  className="fixed inset-0 z-50 bg-neutral-900/30 dark:bg-black/60 backdrop-blur-md"
                />
              </DialogPrimitive.Overlay>
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <DialogPrimitive.Content asChild forceMount>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    className="w-[min(700px,calc(100vw-2rem))] max-h-[85vh] pointer-events-auto outline-none rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0b1120] flex flex-col relative"
                  >
                    <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-1">
                      <DialogClose asChild>
                        <button
                          type="button"
                          className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:cursor-pointer transition-colors"
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </DialogClose>
                    </div>

                    <div className="w-full overflow-y-auto p-6 sm:p-10">
                      <div className="flex items-start justify-between gap-6 mb-8">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] mb-3">
                            Experience
                          </div>
                          <h2 className="text-3xl sm:text-4xl text-neutral-900 dark:text-white tracking-[-0.025em] mb-3">
                            {role}
                          </h2>
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center transition-colors font-medium text-lg"
                          >
                            {company}
                            <MdArrowOutward className="ml-1" />
                          </a>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mt-1 text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
                            <span>{time}</span>
                            {location && (
                              <>
                                <span className="hidden sm:inline text-neutral-300 dark:text-neutral-600">
                                  •
                                </span>
                                <span>{location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        {desc.map((w, i) => (
                          <p
                            key={i}
                            className="text-[16px] leading-[1.625] text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]"
                          >
                            {w}
                          </p>
                        ))}
                      </div>

                      <div className="grid gap-6">
                        {additionalInfo &&
                          additionalInfo.map((section, idx) => (
                            <div key={idx}>
                              <div className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] mb-3">
                                {section.title}
                              </div>
                              <ul className="space-y-2">
                                {section.content.map((item, i) => (
                                  <li
                                    key={i}
                                    className="text-[16px] leading-[1.625] text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] flex items-start"
                                  >
                                    <span className="mr-2 text-neutral-900 dark:text-white">
                                      •
                                    </span>
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
  );
};
export default ExperienceCard;
