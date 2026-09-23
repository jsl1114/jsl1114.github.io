import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PROJECTS } from "@/constants/const";
import ProjectLinks from "@/components/ProjectLinks";
import ProjectGallery from "@/components/ProjectGallery";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import Logo from "@/assets/logo.svg";

const ProjectDetail = () => {
  const { slug } = useParams();
  const project = PROJECTS.find((item) => item.slug === slug);
  const heading = useRef(null);

  useEffect(() => {
    if (!project) return;
    document.title = `${project.title} — Jason Liu`;
    heading.current?.focus({ preventScroll: true });
    return () => {
      document.title = "Jason (Jinsen) Liu";
    };
  }, [project]);

  if (!project) return <NotFound />;

  const {
    title,
    desc,
    image,
    technologies,
    urls,
    screenshots,
    reflections,
  } = project;
  const logoSrc = new URL(`../assets/${image}`, import.meta.url).href;

  return (
    <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
      <header className="flex h-24 items-center justify-center border-b border-black/10 sm:h-28 dark:border-white/10">
        <Link to="/" aria-label="Jason Liu home">
          <img
            src={Logo}
            alt=""
            className="w-8 brightness-50 contrast-125 saturate-150 dark:brightness-100 dark:contrast-100 dark:saturate-100"
          />
        </Link>
      </header>
      <main className="pt-12 sm:pt-12">
        <div>
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={logoSrc}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl bg-white/70 object-contain p-1.5 sm:h-16 sm:w-16 sm:rounded-2xl sm:p-2 lg:h-20 lg:w-20 dark:bg-white/10"
            />
            <h1
              ref={heading}
              tabIndex={-1}
              className="max-w-[18ch] text-[clamp(3rem,7vw,6.5rem)] leading-[1.02] tracking-[-0.035em] text-neutral-900 outline-none dark:text-white"
            >
              {title}
            </h1>
          </div>
          <p className="mt-6 max-w-[60ch] text-pretty text-base leading-relaxed text-[var(--color-muted)] sm:text-lg dark:text-[var(--color-muted-dark)]">
            {desc}
          </p>
          <div className="mt-8">
            <ProjectLinks title={title} urls={urls} fullLabels />
          </div>
        </div>

        <ProjectGallery key={slug} screenshots={screenshots} title={title} />

        <section
          className="mt-14 grid gap-6 border-t border-black/10 py-10 sm:mt-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 dark:border-white/10"
          aria-labelledby="stack-heading"
        >
          <h2
            id="stack-heading"
            className="text-3xl text-neutral-900 sm:text-4xl dark:text-white"
          >
            The stack
          </h2>
          <div className="flex flex-wrap content-start gap-2.5">
            {technologies.map((tech) => (
              <span key={tech} className="chip px-4 py-2 text-sm">
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section
          className="grid gap-8 border-t border-black/10 py-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 dark:border-white/10"
          aria-labelledby="reflections-heading"
        >
          <h2
            id="reflections-heading"
            className="text-3xl text-neutral-900 sm:text-4xl dark:text-white"
          >
            What stayed with me
          </h2>
          <div className="max-w-[65ch] space-y-8">
            {reflections.map((reflection) => (
              <div key={reflection.title}>
                <h3 className="font-sans text-base font-medium tracking-normal text-neutral-900 dark:text-white">
                  {reflection.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]">
                  {reflection.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-6 border-t border-black/10 py-8 dark:border-white/10">
          <Link
            to="/#projects"
            className="inline-flex min-h-11 items-center gap-3 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
