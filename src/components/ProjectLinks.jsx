import { FaLink, FaGithub } from "react-icons/fa6";
import ReactGA from "react-ga4";

const ProjectLinks = ({ title, urls, fullLabels = false }) => (
  <div className="relative z-10 flex flex-wrap items-center gap-3">
    {[
      {
        href: urls.live,
        label: "Visit project",
        action: "live_link_click",
        Icon: FaLink,
      },
      {
        href: urls.github,
        label: "View repository",
        action: "github_link_click",
        Icon: FaGithub,
      },
    ]
      .filter(({ href }) => href)
      .map(({ href, label, action, Icon }) => (
        <a
          key={action}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label}: ${title}`}
          className={
            fullLabels
              ? "pill pill-ghost"
              : "rounded-full p-1 text-neutral-500 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-neutral-400 dark:hover:text-white"
          }
          onClick={() =>
            ReactGA.event({ category: "Projects", action, label: title })
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {fullLabels && label}
        </a>
      ))}
  </div>
);

export default ProjectLinks;
