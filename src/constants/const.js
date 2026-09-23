// Direct channels listed beside the contact form. `value` is what shows under
// the label — keep it short enough to sit on one line.
export const CONTACT_CHANNELS = [
  {
    label: "LinkedIn",
    value: "in/jinsen-liu",
    href: "https://www.linkedin.com/in/jinsen-liu/",
    icon: "linkedin",
  },
  {
    label: "GitHub",
    value: "jsl1114",
    href: "https://github.com/jsl1114",
    icon: "github",
  },
  {
    label: "Google Meet",
    value: "Book a time with me",
    href: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1Ogi016XOjaq0g6Jiyi73-xI6tgs1M2OeZ-3exQTZAghPE6nOlV8qzS7re2m0D8Tw_6O29-3nZ",
    icon: "meet",
  },
];

export const SECTIONS = [
  { name: "Home", id: "hero" },
  { name: "Experience", id: "experience" },
  { name: "Projects", id: "projects" },
  { name: "Education", id: "education" },
  { name: "Contact", id: "contact" },
];

export const EDUCATION = [
  {
    school: "New York University (Courant)",
    degree: "B.A. in Computer Science",
    year: "2022-2026",
    location: "New York, NY",
    coursework: [
      "Web Development",
      "Software Engineering",
      "Data Structures",
      "Algorithms",
      "Database Systems",
      "Machine Learning",
      "Artificial Intelligence",
      "Parallel Computing",
    ],
  },
  {
    school: "New York University (CAS & Stern)",
    degree: "Minor in Business Studies",
    year: "2024-2026",
    location: "New York, NY",
    gpa: "",
    coursework: [
      "Business Analytics",
      "Financial Accounting",
      "Marketing",
      "Management",
    ],
  },
];

export const EXPERIENCE = [
  {
    link: "https://nyu.edu",
    company: "New York University",
    role: "Full Stack Software Engineer",
    time: "Apr 2025 - Present",
    location: "New York, NY",
    desc: [
      "Build, maintain and improve websites for NYU CAS IT, including the Foreign Language Placement Exam Portal, ULC Scheduler, Advising Portal, GPA Calculator, etc",
      "Drive collaboration and innovation in a highly agile development environment, contributing to faster product iterations and improved team efficiency",
    ],
    additionalInfo: [
      {
        title: "Things I Like The Most",
        content: [
          "The unlimited diet coke and snack supply in the office (it fuels the code)",
          "Seeing students actually use the tools I built without crashing them",
          "The view from the window - concrete jungle dreams",
        ],
      },
      {
        title: "Fun Fact",
        content: [
          "I once debugged a production issue while eating a cookie",
          "There is no window in my office so I had to step out for the view",
        ],
      },
    ],
  },
  {
    link: "https://scale.com",
    company: "Scale AI",
    role: "Software Engineer for AI Training",
    time: "May 2024 - Present",
    location: "Remote",
    desc: [
      "Conduct comprehensive evaluations of AI-generated code quality",
      "Engineer and implement high-performing code solutions to complex programming challenges",
    ],
    additionalInfo: [
      {
        title: "Things I Like The Most",
        content: [
          "Teaching robots how to code better than humans (scary but cool)",
          "Working in my pajamas",
        ],
      },
    ],
  },
  {
    link: "https://cs.nyu.edu/home/index.html",
    company: "NYU Courant",
    role: "Teaching Assistant",
    time: "Sept 2023 - Dec 2023",
    location: "New York, NY",
    desc: [
      "Assisted in grading assignments and exams, providing constructive feedback to students",
      "Conducted weekly office hours to clarify concepts and provide additional support",
    ],
    additionalInfo: [
      {
        title: "Things I Like The Most",
        content: [
          "The 'Aha!' moment on a student's face",
          "Being called 'Professor' by mistake (I didn't correct them)",
          "Grading papers with a red pen – it's oddly satisfying",
        ],
      },
      {
        title: "Fun Fact",
        content: [
          "I learned more from the students' questions than they did from me",
        ],
      },
    ],
  },
  {
    link: "https://www.linkedin.com/company/huaxi-securities-co-ltd/",
    company: "Huaxi Securities Co. Ltd.",
    role: "Software Engineer Intern",
    time: "June 2023 - Aug 2023",
    location: "Chengdu, China",
    desc: [
      "Enhanced website stability through the implementation of End-to-End (E2E) testing using cypress for services",
      "Documented API for comprehensive reference and streamlined processes, increased efficiency by 20%",
    ],
    additionalInfo: [
      {
        title: "Things I Like The Most",
        content: [
          "The amazing hot pot lunches in Chengdu",
          "Learning that 'stable' is a relative term",
          "My first code merge that didn't break the build",
        ],
      },
      {
        title: "Fun Fact",
        content: [
          "I spent 20% of my time coding and 80% trying to understand the legacy codebase",
        ],
      },
    ],
  },
];

export const TECHNOLOGIES = [
  "react",
  "next.js",
  "vue.js",
  "javascript",
  "typescript",
  "mongodb",
  "nodedotjs",
  "vite",
  "vitepress",
  "express",
  "vim",
  "git",
  "github",
  "gitee",
  "gitlab",
  "vercel",
  "netlify",
  "c",
  "cplusplus",
  "python",
  "sqlite",
  "mysql",
  "jupyter",
  "tensorflow",
];

// Project reflections are editable first-person drafts.
export const PROJECTS = [
  {
    title: "Inky",
    slug: "inky",
    reflections: [
      {
        title: "Making coordination feel simple",
        description:
          "What interested me most was how much complexity hides inside a simple scheduling task. I learned to think about the decisions people need to make, then use explicit states in XState to keep those steps understandable.",
      },
      {
        title: "Connecting the pieces",
        description:
          "Working with Drizzle, TipTap, and Vitest helped me see scheduling as more than a calendar interface. I learned to consider how stored data, editing interactions, and tests support the same user flow.",
      },
    ],
    desc: "A group scheduling tool designed to streamline coordination, minimize back-and-forth, and save time for teams",
    technologies: ["Next.JS", "Drizzle", "XState", "TipTap", "Vitest"],
    urls: {
      live: "https://inky.jasonl.us/",
    },
    image: "inky.png",
    screenshots: [
      "inky1.webp",
      "inky2.webp",
      "inky3.webp",
      "inky4.webp",
      "inky5.webp",
      "inky6.webp",
      "inky7.webp",
    ],
  },
  {
    title: "Lobster AI",
    slug: "lobster-ai",
    reflections: [
      {
        title: "One interface, different kinds of AI",
        description:
          "I found it interesting to bring text, image, video, code, and music generation into one product. It pushed me to think about what should feel consistent across tools and what needs to be specific to each medium.",
      },
      {
        title: "Beyond the API call",
        description:
          "I learned that integrating a model is only one part of an AI application. Connecting the interface, persistence, and deployment helped me understand how the surrounding product shapes the experience.",
      },
    ],
    desc: "A Software-as-a-Service (SaaS) platform that provides all-in-one solutions for AI chatbot, image generation, video generation, code editing and music generation.",
    technologies: [
      "Next.JS",
      "OpenAI",
      "Replicate AI",
      "Prisma",
      "Vercel",
      "MongoDB",
      "Tailwind CSS",
      "CI/CD",
    ],
    urls: {
      github: "https://github.com/jsl1114/Lobster-AI",
      live: "https://lobster-ai.vercel.app/",
    },
    image: "lobster.png",
    screenshots: [
      "lobster1.webp",
      "lobster2.webp",
      "lobster3.webp",
      "lobster4.webp",
    ],
  },
  {
    title: "PATH LIVE",
    slug: "path-live",
    reflections: [
      {
        title: "Designing around a moment",
        description:
          "What interested me was the very practical question of when the next train arrives. I learned to prioritize information for someone making a quick decision, rather than treating every piece of data as equally important.",
      },
      {
        title: "Following data through the system",
        description:
          "Connecting React with Spring Boot gave me a better understanding of how backend data becomes a useful interface. I also found geolocation interesting as a way to make the same information more relevant to the person viewing it.",
      },
    ],
    desc: "A full-stack real-time platform for tracking train departures in the Port Authority Trans-Hudson transit system",
    technologies: [
      "React",
      "Spring Boot",
      "Tailwind CSS",
      "Geolocation",
      "CI/CD",
    ],
    urls: {
      live: "https://path.jasonl.us",
    },
    image: "pathlive.png",
    screenshots: ["pathlive1.webp"],
  },
  {
    title: "SHell",
    slug: "shell",
    reflections: [
      {
        title: "Looking underneath familiar commands",
        description:
          "Building a shell made everyday terminal commands much more interesting to me. I learned how process execution, pipes, and redirection work together beneath an interface I usually take for granted.",
      },
      {
        title: "Thinking in lifecycles",
        description:
          "Working in C encouraged me to reason carefully about resources and the lifetime of a process. I learned to break complex command behavior into smaller steps, especially when background jobs and input/output interact.",
      },
    ],
    desc: "A simple Linux shell that supports piping, redirection, and background processes and many built-in commands.",
    technologies: ["C", "Unix", "Linux"],
    urls: {
      github: "https://github.com/jsl1114/SHell",
    },
    image: "shell.png",
    screenshots: [],
    extended: true,
  },
  {
    title: "BrownJack",
    slug: "brownjack",
    reflections: [
      {
        title: "The bug wasn't where it felt like it was",
        description:
          "When the game felt unfair, I expected to find a broken shuffle. The shuffle was fine; the real problems were two games running at once, a dealer that chased the player's total, and a running total that broke on face cards. I learned to test my assumptions before fixing the thing that seems most obviously wrong.",
      },
      {
        title: "Tuning with simulations",
        description:
          "I found it interesting to design a ranking that gets harder as you climb. Instead of guessing point values, I simulated hundreds of thousands of hands of basic-strategy play to see how long each tier takes and how rare each badge really is, then tuned the numbers until the curve felt right.",
      },
      {
        title: "Rewards that feel earned",
        description:
          "Building badges, rank-up animations and sounds taught me how much small moments of feedback shape a game. I learned to match each celebration to how rare the achievement is, and to lock it briefly so it can't be dismissed by a key press meant for the game.",
      },
      {
        title: "Keeping the rules honest",
        description:
          "I kept the rules, scoring and save files as small pure modules with their own tests, separate from the page. That made it much easier to add doubles, splits, a six-deck shoe and seasons without breaking what already worked, and to reject tampered or damaged save files.",
      },
    ],
    desc: "A browser Blackjack game with ranked seasons, 61 badges, a basic-strategy coach, doubles and splits, and a daily challenge with the same deal for everyone.",
    technologies: ["HTML", "CSS", "JavaScript", "Web Audio API", "node:test"],
    urls: {
      github:
        "https://github.com/jsl1114/jsl1114.github.io/tree/v2/public/projects/brownjack",
      live: "https://jsl1114.github.io/projects/brownjack/game.html",
    },
    image: "brown.webp",
    screenshots: ["brown1.webp", "brown2.webp", "brown3.webp", "brown4.webp"],
  },
  {
    title: "Terminal Portfolio",
    slug: "terminal-portfolio",
    reflections: [
      {
        title: "A different way to tell my story",
        description:
          "I enjoyed exploring how a terminal could become a personal portfolio. The interesting challenge was making a familiar developer interface approachable enough for someone who might never use a command line.",
      },
      {
        title: "Helping people explore",
        description:
          "Working on commands and keyboard interactions taught me to think about discoverability. I learned that a playful interface still needs to help visitors understand what they can do and where to find the information they want.",
      },
      {
        title: "Playing with color",
        description:
          "Adding switchable themes turned into a small design playground. I learned how to experiment with colors and design themes, and how the same text-only screen can feel completely different depending on the palette, contrast, and accent I give it.",
      },
    ],
    desc: "A terminal-based portfolio website for those of you who love the command line interface. It is a fun and interactive way to learn more about me and my projects.",
    technologies: ["HTML", "CSS", "JavaScript"],
    urls: {
      github:
        "https://github.com/jsl1114/jsl1114.github.io/tree/v2/public/projects/terminal_website",
      live: "https://jsl1114.github.io/projects/terminal_website/index.html",
    },
    image: "term.webp",
    screenshots: ["term1.webp","term3.webp","term4.webp","term5.webp","term6.webp","term7.webp","term8.webp","term9.webp","term10.webp",],
  },
  {
    title: "Portfolio Website (v2.3)",
    slug: "portfolio",
    reflections: [
      {
        title: "Designing for the work itself",
        description:
          "I found it interesting to build a place where the presentation supports the projects. I learned to think more carefully about typography, spacing, and hierarchy as part of communicating my work.",
      },
      {
        title: "Refining across screens",
        description:
          "Building with React and Tailwind helped me connect reusable components with responsive design. I learned that a layout needs to be considered across screen sizes, themes, and navigation states—not just in a single screenshot.",
      },
    ],
    desc: "You are seeing it now! Crafted from scratch, built with love and passion. If you have made this far, thank you for visiting my website, I hope you enjoy it as much as I do! I am constantly updating it, so please check back often!",
    technologies: ["React", "Vite", "Tailwind CSS", "CI/CD"],
    urls: {
      github: "https://github.com/jsl1114/jsl1114.github.io",
      live: "https://jsl1114.github.io/",
    },
    image: "jl.png",
    screenshots: ["jl1.webp", "jl2.webp"],
  },
];
