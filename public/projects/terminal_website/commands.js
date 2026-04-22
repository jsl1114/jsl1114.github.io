// personal
var password = "hirethisguy";
var linkedin = "https://www.linkedin.com/in/jinsen-liu/";
var instagram = "https://www.instagram.com/jsl1114/";
var github = "https://github.com/jsl1114/";
var email = "mailto:hirejasonl@gmail.com";
var wechat = "email me :)";
var resume = "https://jsl1114.github.io/assets/jason_liu_cv.pdf";
var currentYear = new Date().getFullYear();

// projects
var lobster = "https://lobster-ai.vercel.app/";
var brownjack =
  "https://jsl1114.github.io/src/assets/projects/brownjack/game.html";
var personal_website = "https://jsl1114.github.io";
var pathLive = "https://path.jasonl.us/";

whois = [
  "<br>",
  "Hey, I'm Jason!👋",
  'My Chinese name is <span class="highlight">刘锦森</span>, and I am a Senior at NYU Courant & a University Honors Scholar at NYU.',
  "I am studying Computer Science and Data Science, with a minor in Business Studies.",
  "I am a full stack software engineer focused on building fast, intuitive, and production-ready web experiences.",
  "I grew up in Chengdu and studied at CDFLS before moving to the U.S. for high school.",
  "I attended Rutgers Preparatory School in New Jersey, and graduated with Honors With Distinction in 2022.",
  "I am actively seeking frontend, backend, and full stack opportunities.",
  "I bring 5 years of full stack project experience and 3 years of professional engineering experience.",
  'For more details, view my <a href="' +
    resume +
    '" target="_blank" rel="noopener noreferrer">current Resume</a>.',
  "<br>",
];

whoami = [
  "<br>",
  "The paradox of “Who am I?” is: we never know, but, we constantly find out.",
  "<br>",
];

social = [
  "<br>",
  'linkedin       <a href="' +
    linkedin +
    '" target="_blank">linkedin/jinsenliu' +
    "</a>",
  'instagram      <a href="' +
    instagram +
    '" target="_blank">instagram/jsl1114' +
    "</a>",
  'github         <a href="' +
    github +
    '" target="_blank">github/jsl1114' +
    "</a>",
  "wechat         " + wechat,
  "<br>",
];

secret = [
  "<br>",
  '<span class="command">sudo</span>           Only use if you\'re admin... or maybe not use it',
  "<br>",
];

projects = [
  "<br>",
  '<span class="highlight">LobsterAI</span>                 <span><a target="_blank" href=' +
    lobster +
    ">visit</a></span>    AI SaaS platform that combines the magic of latest Generative Pre-trained Transformers ",
  '<span class="highlight">Path Live</span>                 <span><a target="_blank" href=' +
    pathLive +
    ">visit</a></span>    live route planning and path visualization tool",
  '<span class="highlight">BrownJack</span>                 <span><a target="_blank" href=' +
    brownjack +
    ">visit</a></span>    pure JS injected blackjack game",
  '<span class="highlight">jsl1114.github.io</span>         <span><a target="_blank" href=' +
    personal_website +
    ">visit</a></span>    Jason's personal website with latest updates",
  '<span class="highlight">Interactive terminal</span>               You are already here!',
  "<br>",
  "more are under development, on github or private.",
  "<br>",
];

help = [
  "<br>",
  '<span class="command">whois</span>                   Who is Jason?',
  '<span class="command">whoami</span>                  Who are you?',
  '<span class="command">projects</span>                View selected projects',
  '<span class="command">github</span>                  View on Github',
  '<span class="command">linkedin</span>                View on LinkedIn',
  '<span class="command">email</span>                   Reach out',
  '<span class="command">resume | cv</span>             View resume',
  '<span class="command">social</span>                  Display social networks',
  '<span class="command">banner</span>                  Display the banner',
  '<span class="command">history</span>                 View command history',
  '<span class="command">themes</span>                  List available terminal styles',
  '<span class="command">theme &lt;name|number&gt;</span>     Switch style (eg: theme 2 or theme aurora-noir)',
  '<span class="command">main</span>                    Go to Jason\'s homepage',
  '<span class="command">clear</span>                   Clear terminal',
  '<span class="command">help | man</span>              You obviously already know what this does',
  "<br>",
];

banner = [
  // "       ░▒▓█▓▒░ ░▒▓█▓▒░ ░▒▓███████▓▒░   ░▒▓███████▓▒░ ░▒▓████████▓▒░ ░▒▓███████▓▒░        ░▒▓█▓▒░        ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ",
  // "       ░▒▓█▓▒░ ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░        ░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░        ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ",
  // "       ░▒▓█▓▒░ ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░        ░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░        ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ",
  // "       ░▒▓█▓▒░ ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░  ░▒▓██████▓▒░  ░▒▓██████▓▒░   ░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░        ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ",
  // "░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░        ░▒▓█▓▒░ ░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░        ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ",
  // "░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░        ░▒▓█▓▒░ ░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░        ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ",
  // " ░▒▓██████▓▒░  ░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓███████▓▒░  ░▒▓████████▓▒░ ░▒▓█▓▒░░▒▓█▓▒░       ░▒▓████████▓▒░ ░▒▓█▓▒░  ░▒▓██████▓▒░  ",
  // "                                                                                                         &copy; 2026 Jinsen Liu",
  "     gg                                                                       ,gggg,                    ",
  '    dP8,                                                                     d8" "8I                    ',
  "   dP Yb                                                                     88  ,dP                    ",
  '  ,8  `8,     gg                                                          8888888P"     gg              ',
  '  I8   Yb     ""                                                             88         ""              ',
  "  `8b, `8,    gg    ,ggg,,ggg,     ,g,      ,ggg,    ,ggg,,ggg,              88         gg   gg      gg ",
  '   `"Y88888   88   ,8" "8P" "8,   ,8\'8,    i8" "8i  ,8" "8P" "8,        ,aa,_88         88   I8      8I ',
  '       "Y8    88   I8   8I   8I  ,8\'  Yb   I8, ,8I  I8   8I   8I       dP" "88P         88   I8,    ,8I ',
  "        ,88,_,88,_,dP   8I   Yb,,8'_   8)  `YbadP' ,dP   8I   Yb,      Yb,_,d88b,,_   _,88,_,d8b,  ,d8b,",
  '    ,ad888888P""Y88P\'   8I   `Y8P\' "YY8P8P888P"Y8888P\'   8I   `Y8       "Y8P"  "Y888888P""Y88P\'"Y88P"`Y8',
  "  ,dP\"'   Yb                                                                                            ",
  " ,8'      I8                                                                          &copy; " +
    currentYear +
    " Jinsen Liu",
  ",8'       I8                                                                                            ",
  "I8,      ,8'                                                                                            ",
  "`Y8,___,d8'                                                                                             ",
  '  "Y888P"                                                                                                ',
  "                                                                                                 ",
  '<span class="color2">Welcome to my interactive web terminal.</span>',
  '<span class="color2">For a list of available commands, type <span class="command">\'help\'</span> or <span class="command">\'man\'</span>.</span>',
];
