export const SOCIALS = [
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/jinsen-liu/",
  },
  {
    name: "GitHub",
    link: "https://github.com/jsl1114",
  },
  {
    name: "Email",
    link: "mailto:jl13869@nyu.edu",
  },
  {
    name: "CV",
    link: "../assets/jason_liu_cv.pdf",
  },
];

export const SECTIONS = [
  { name: "Home", id: "hero" },
  { name: "Education", id: "education" },
  { name: "Experience", id: "experience" },
  { name: "Projects", id: "projects" },
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
    role: "Lead Full Stack Software Engineer",
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
    role: "Coding Exptertise for AI Training",
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
          "The feeling when the AI finally understands recursion",
        ],
      },
      {
        title: "Fun Fact",
        content: [
          "I'm pretty sure the AI is learning my bad coding habits too",
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

export const PROJECTS = [
  {
    title: "Lobster AI",
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
  },
  {
    title: "SHell",
    desc: "A simple Linux shell that supports piping, redirection, and background processes and many built-in commands.",
    technologies: ["C", "Unix", "Linux"],
    urls: {
      github: "https://github.com/jsl1114/SHell",
    },
    image: "shell.png",
  },
  {
    title: "BrownJack",
    desc: "A client-side Blackjack game that allows users to play against an computer that behaves like a dealer with customizable functions.",
    technologies: ["HTML", "CSS", "JavaScript"],
    urls: {
      github:
        "https://github.com/jsl1114/jsl1114.github.io/tree/v2/public/projects/brownjack",
      live: "https://jsl1114.github.io/projects/brownjack/game.html",
    },
    image: "brown.webp",
  },
  {
    title: "Terminal Portfolio",
    desc: "A terminal-based portfolio website for those of you who love the command line interface. It is a fun and interactive way to learn more about me and my projects.",
    technologies: ["HTML", "CSS", "JavaScript"],
    urls: {
      github:
        "https://github.com/jsl1114/jsl1114.github.io/tree/v2/public/projects/terminal_website",
      live: "https://jsl1114.github.io/projects/terminal_website/index.html",
    },
    image: "term.webp",
  },
  {
    title: "Portfolio Website (currently v2)",
    desc: "You are seeing it now! Crafted from scratch, built with love and passion. If you have made this far, thank you for visiting my website, I hope you enjoy it as much as I do! I am constantly updating it, so please check back often!",
    technologies: ["React", "Vite", "Tailwind CSS", "CI/CD"],
    urls: {
      github: "https://github.com/jsl1114/jsl1114.github.io",
      live: "https://jsl1114.github.io/",
    },
    image: "jl.png",
  },
];
