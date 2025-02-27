export const SOCIALS = [
  {
    name: 'LinkedIn',
    icon: 'FaLinkedinIn',
    link: 'https://www.linkedin.com/in/jinsen-liu/',
  },
  {
    name: 'GitHub',
    icon: 'FiGithub',
    link: 'https://github.com/jsl1114',
  },
  {
    name: 'Email',
    icon: 'TbMail',
    link: 'mailto:jl13869@nyu.edu',
  },
  {
    name: 'CV',
    icon: 'FaRegFilePdf',
    link: '../assets/cv_english.pdf',
  },
]

export const EDUCATION = [
  {
    school: 'New York University (Courant)',
    degree: 'B.A. in Computer Science',
    year: '2022-2026',
    location: 'New York, NY',
    gpa: '3.8/4.0',
    coursework: [
      'Web Development',
      'Software Engineering',
      'Data Structures',
      'Algorithms',
      'Database Systems',
      'Machine Learning',
      'Artificial Intelligence',
      'Parallel Computing',
    ],
  },
  {
    school: 'New York University (CAS & Stern)',
    degree: 'Minor in Business Studies',
    year: '2024-2026',
    location: 'New York, NY',
    gpa: '',
    coursework: [
      'Business Analytics',
      'Financial Accounting',
      'Marketing',
      'Management',
    ],
  },
]

export const EXPERIENCE = [
  {
    link: 'https://scale.com',
    company: 'Scale AI',
    role: 'Coding Exptertise for AI Training',
    time: 'May 2024 - Present',
    location: 'Remote',
    desc: [
      '• Conducted comprehensive evaluations of AI-generated code quality with detailed and insightful rationales',
      '• Engineered and implemented efficient, high-performing code solutions to complex programming challenges',
    ],
  },
  {
    link: 'https://cs.nyu.edu/home/index.html',
    company: 'NYU Courant Institute',
    role: 'Teaching Assistant',
    time: 'Sept 2023 - Dec 2023',
    location: 'New York, NY',
    desc: [
      '• Assisted in grading assignments and exams, providing constructive feedback to students',
      '• Conducted weekly office hours to clarify concepts and provide additional support',
    ],
  },
  {
    link: 'https://www.linkedin.com/company/huaxi-securities-co-ltd/',
    company: 'Huaxi Securities Co. Ltd.',
    role: 'Software Engineer Intern - Web Application Development',
    time: 'June 2023 - Aug 2023',
    location: 'Chengdu, China',
    desc: [
      '• Enhanced website stability through the implementation of End-to-End (E2E) testing using cypress for services',
      '• Documented API for comprehensive reference and streamlined processes, increased efficiency by 20%',
    ],
  },
]

export const TECHNOLOGIES = [
  'react',
  'next.js',
  'vue.js',
  'javascript',
  'typescript',
  'mongodb',
  'nodedotjs',
  'vite',
  'vitepress',
  'express',
  'vim',
  'git',
  'github',
  'gitee',
  'gitlab',
  'vercel',
  'netlify',
  'c',
  'cplusplus',
  'python',
  'sqlite',
  'mysql',
  'jupyter',
  'tensorflow',
]

export const PROJECTS = [
  {
    title: 'Lobster AI',
    desc: 'A Software-as-a-Service (SaaS) platform that provides all-in-one solutions for AI chatbot, image generation, video generation, code editing and music generation.',
    technologies: [
      'Next.JS',
      'OpenAI',
      'Replicate AI',
      'Prisma',
      'Vercel',
      'MongoDB',
      'Tailwind CSS',
      'CI/CD',
    ],
    urls: {
      github: 'https://github.com/jsl1114/Lobster-AI',
      live: 'https://lobster-ai.vercel.app/',
    },
    image: 'lobster.png',
  },
  {
    title: 'SHell',
    desc: 'A simple Linux shell that supports piping, redirection, and background processes and many built-in commands.',
    technologies: ['C', 'Unix', 'Linux'],
    urls: {
      github: 'https://github.com/jsl1114/SHell',
    },
    image: 'shell.png',
  },
  {
    title: 'BrownJack',
    desc: 'A client-side Blackjack game that allows users to play against an computer that behaves like a dealer with customizable functions.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    urls: {
      github:
        'https://github.com/jsl1114/jsl1114.github.io/tree/v2/public/projects/brownjack',
      live: 'https://jsl1114.github.io/projects/brownjack/game.html',
    },
    image: 'brown.webp',
  },
  {
    title: 'Terminal Portfolio',
    desc: 'A terminal-based portfolio website for those of you who love the command line interface. It is a fun and interactive way to learn more about me and my projects.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    urls: {
      github:
        'https://github.com/jsl1114/jsl1114.github.io/tree/v2/public/projects/terminal_website',
      live: 'https://jsl1114.github.io/projects/terminal_website/index.html',
    },
    image: 'term.webp',
  },
  {
    title: 'Portfolio Website (currently v2)',
    desc: 'You are seeing it now! Crafted from scratch, built with love and passion. If you have made this far, thank you for visiting my website, I hope you enjoy it as much as I do! I am constantly updating it, so please check back often!',
    technologies: ['React', 'Vite', 'Tailwind CSS', 'CI/CD'],
    urls: {
      github: 'https://github.com/jsl1114/jsl1114.github.io',
      live: 'https://jsl1114.github.io/',
    },
    image: 'jl.png',
  },
]
