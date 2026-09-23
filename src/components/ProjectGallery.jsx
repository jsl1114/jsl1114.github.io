import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";

const ImageNavigation = ({ move }) => (
  <div className="gallery-image-navigation absolute inset-0 z-10">
    <button
      type="button"
      tabIndex={-1}
      aria-label="Previous screenshot on image"
      onClick={() => move(-1)}
      className="gallery-image-previous h-full w-1/2"
    />
    <button
      type="button"
      tabIndex={-1}
      aria-label="Next screenshot on image"
      onClick={() => move(1)}
      className="gallery-image-next h-full w-1/2"
    />
  </div>
);

const ProjectGallery = ({ screenshots, title }) => {
  const [active, setActive] = useState(0);
  const images = screenshots.map(
    (file) => new URL(`../assets/projects/${file}`, import.meta.url).href,
  );
  const move = (direction) =>
    setActive((index) => (index + direction + images.length) % images.length);

  if (!images.length) return null;

  return (
    <section aria-label={`${title} gallery`} className="mt-12 sm:mt-16">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl text-neutral-900 dark:text-white">
          A closer look
        </h2>
        <div className="flex items-center gap-3">
          <span
            className="text-xs tabular-nums text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]"
            aria-live="polite"
          >
            {active + 1} / {images.length}
          </span>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous screenshot"
                className="gallery-control"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next screenshot"
                className="gallery-control"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
      <Dialog.Root>
        <div className="relative">
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-black/10 bg-black/[.025] focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-white/10 dark:bg-white/[.025]"
              aria-label={`Enlarge ${title} screenshot ${active + 1}`}
            >
              <img
                src={images[active]}
                alt={`${title} screenshot ${active + 1}`}
                className="aspect-[16/10] w-full object-contain"
              />
            </button>
          </Dialog.Trigger>
          {images.length > 1 && <ImageNavigation move={move} />}
          <Dialog.Trigger asChild>
            <button
              type="button"
              aria-label="Open full-size gallery"
              className="absolute right-4 bottom-4 z-20 flex min-h-11 items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-sm"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Enlarge
            </button>
          </Dialog.Trigger>
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-50 w-[94vw] max-w-[1500px] -translate-x-1/2 -translate-y-1/2 outline-none"
            onKeyDown={(event) => {
              if (
                images.length > 1 &&
                (event.key === "ArrowLeft" || event.key === "ArrowRight")
              ) {
                event.preventDefault();
                move(event.key === "ArrowLeft" ? -1 : 1);
              }
            }}
          >
            <Dialog.Title className="sr-only">{title} gallery</Dialog.Title>
            <div className="mb-3 flex items-center justify-between text-white">
              <span className="text-sm" aria-live="polite">
                {active + 1} / {images.length}
              </span>
              <Dialog.Close
                aria-label="Close gallery"
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            <div className="relative mx-auto w-fit max-w-full">
              <img
                src={images[active]}
                alt={`${title} screenshot ${active + 1}`}
                className="mx-auto max-h-[70svh] max-w-full rounded-lg object-contain"
              />
              {images.length > 1 && <ImageNavigation move={move} />}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex justify-center gap-4 text-white">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Previous screenshot"
                  className="flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Next screenshot"
                  className="flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {images.length > 1 && (
        <div
          className="gallery-strip mt-4 flex gap-3 overflow-x-auto pt-2 pb-3"
          aria-label="Choose a screenshot"
        >
          {images.map((src, index) => (
            <button
              type="button"
              key={src}
              onClick={() => setActive(index)}
              aria-label={`Show screenshot ${index + 1}`}
              aria-pressed={index === active}
              className={`shrink-0 overflow-hidden rounded-lg border-2 p-1 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 ${index === active ? "border-neutral-800 dark:border-white" : "border-transparent opacity-50 hover:opacity-100"}`}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-14 w-24 rounded object-cover sm:h-16 sm:w-28"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProjectGallery;
