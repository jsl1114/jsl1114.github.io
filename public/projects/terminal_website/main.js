var before = document.getElementById("before");
var liner = document.getElementById("liner");
var command = document.getElementById("typer");
var textarea = document.getElementById("texter");
var terminal = document.getElementById("terminal");

var terminalThemes = {
  "evergreen-grid": "Evergreen Grid",
  "aurora-noir": "Aurora Noir",
  "sunset-amber": "Sunset Amber",
  "glacier-mint": "Glacier Mint",
  "noir-paper": "Noir Paper",
  "citrus-pop": "Citrus Pop",
  "volcanic-red": "Volcanic Red",
  "royal-sapphire": "Royal Sapphire",
  "candy-neon": "Candy Neon",
  "jade-ember": "Jade Ember",
};
var terminalThemeOrder = [
  "evergreen-grid",
  "aurora-noir",
  "sunset-amber",
  "glacier-mint",
  "noir-paper",
  "citrus-pop",
  "volcanic-red",
  "royal-sapphire",
  "candy-neon",
  "jade-ember",
];

var git = 0;
var pw = false;
let pwd = false;
var commands = [];

initTheme();

setTimeout(function () {
  loopLines(banner, "highlight", 80);
  textarea.focus();
}, 100);

window.addEventListener("keyup", enterKey);

//init
textarea.value = "";
command.innerHTML = textarea.value;

function enterKey(e) {
  if (e.keyCode == 181) {
    document.location.reload(true);
  }
  if (pw) {
    let et = "*";
    let w = textarea.value.length;
    command.innerHTML = et.repeat(w);
    if (textarea.value === password) {
      pwd = true;
    }
    if (pwd && e.keyCode == 13) {
      loopLines(secret, "color2 margin", 120);
      command.innerHTML = "";
      textarea.value = "";
      pwd = false;
      pw = false;
      liner.classList.remove("password");
    } else if (e.keyCode == 13) {
      addLine("Wrong password", "error", 0);
      command.innerHTML = "";
      textarea.value = "";
      pw = false;
      liner.classList.remove("password");
    }
  } else {
    if (e.keyCode == 13) {
      commands.push(command.innerHTML);
      git = commands.length;
      addLine("\r  ", "no-animation", 0);
      addLine(
        "visitor@jsl1114.github.io:~$ " + command.innerHTML,
        "no-animation",
        0,
      );
      commander(command.innerHTML.toLowerCase());
      command.innerHTML = "";
      textarea.value = "";
    }
    if (e.keyCode == 38 && git != 0) {
      git -= 1;
      textarea.value = commands[git];
      command.innerHTML = textarea.value;
    }
    if (e.keyCode == 40 && git != commands.length) {
      git += 1;
      if (commands[git] === undefined) {
        textarea.value = "";
      } else {
        textarea.value = commands[git];
      }
      command.innerHTML = textarea.value;
    }
  }
}

function commander(cmd) {
  var normalized = cmd.trim().toLowerCase();
  var parts = normalized.split(/\s+/);
  var commandName = parts[0];
  var arg = parts[1];

  switch (commandName) {
    case "help":
    case "man":
      loopLines(help, "color2 margin", 80);
      break;
    case "whois":
      loopLines(whois, "color2 margin", 80);
      break;
    case "whoami":
      loopLines(whoami, "color2 margin", 80);
      break;
    case "linkedin":
      addLine("Opening LinkedIn...", "color2", 80);
      newTab(linkedin);
      break;
    case "sudo":
      addLine("Oh no, you're not admin...", "color2", 80);
      setTimeout(function () {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      }, 1000);
      break;
    case "social":
      loopLines(social, "color2 margin", 80);
      break;
    case "secret":
      liner.classList.add("password");
      pw = true;
      break;
    case "projects":
      loopLines(projects, "color2 margin", 80);
      break;
    case "pw":
    case "password":
      addLine(
        "<span class=\"inherit\"> Lol! You're joking, right? You're gonna have to try harder than that!😂</span>",
        "error",
        100,
      );
      break;
    case "history":
      addLine("<br>", "", 0);
      loopLines(commands, "color2", 80);
      addLine("<br>", "command", 80 * commands.length + 50);
      break;
    case "themes":
    case "styles":
      addLine("<br>", "color2", 0);
      addLine("Available styles:", "color2", 60);
      terminalThemeOrder.forEach(function (themeName, index) {
        addLine(
          "  " + (index + 1) + ". " + themeName,
          "color2",
          140 + index * 70,
        );
      });
      addLine("<br>", "color2", 140 + terminalThemeOrder.length * 70);
      addLine(
        'Use <span class="command">theme &lt;number|name&gt;</span> to switch.',
        "color2",
        200 + terminalThemeOrder.length * 70,
      );
      break;
    case "theme":
    case "style":
      if (!arg) {
        addLine(
          'Current style: <span class="highlight">' +
            document.body.dataset.theme +
            "</span>",
          "color2",
          80,
        );
        addLine(
          'Type <span class="command">themes</span> to see all options.',
          "color2",
          140,
        );
        break;
      }

      var selectedTheme = resolveThemeArg(arg);
      if (selectedTheme && setTheme(selectedTheme)) {
        addLine(
          'Style switched to <span class="highlight">' +
            selectedTheme +
            "</span>.",
          "color2",
          80,
        );
      } else {
        addLine(
          'Unknown style <span class="error">' +
            arg +
            '</span>. Type <span class="command">themes</span>.',
          "error",
          80,
        );
      }
      break;
    case "email":
      addLine(
        'Email: <a href="' +
          email +
          '">' +
          email.replace("mailto:", "") +
          "</a>",
        "color2",
        80,
      );
      newTab(email);
      break;
    case "resume":
    case "cv":
      addLine(
        'Opening resume: <a href="' + resume + '" target="_blank">view pdf</a>',
        "color2",
        80,
      );
      newTab(resume);
      break;
    case "clear":
      setTimeout(function () {
        terminal.innerHTML = '<a id="before"></a>';
        before = document.getElementById("before");
      }, 1);
      break;
    case "banner":
      loopLines(banner, "highlight", 80);
      break;
    case "instagram":
      addLine("Opening Instagram...", "color2", 0);
      newTab(instagram);
      break;
    case "github":
      addLine("Opening GitHub...", "color2", 0);
      newTab(github);
      break;
    case "wechat":
      addLine(
        'Type <span class="command">social</span> to find out',
        "color2",
        0,
      );
      break;
    case "ai":
    case "lobster":
      addLine("Opening LobsterAI...");
      newTab(lobster);
      break;
    case "brownjack":
      addLine("Opening BrownJack...");
      newTab(brownjack);
      break;
    case "main":
      addLine("Opening https://jsl1114.github.io...");
      newTab(personal_website);
      break;
    default:
      addLine(
        '<span class="inherit">Command not found. For a list of commands, type <span class="command">\'help\'</span> or <span class="command">\'man\'</span>.</span>',
        "error",
        100,
      );
      break;
  }
}

function initTheme() {
  var savedTheme = localStorage.getItem("terminal-theme");
  if (savedTheme && terminalThemes[savedTheme]) {
    setTheme(savedTheme);
    return;
  }

  setTheme(getWeekdaySeededTheme(), false);
}

function getWeekdaySeededTheme() {
  var now = new Date();
  var dayOfWeek = now.getDay();
  var weekOfYear = getWeekOfYear(now);
  var year = now.getFullYear();

  // Build a stable daily seed that includes weekday as a direct component.
  var seed = year * 1000 + weekOfYear * 10 + dayOfWeek;
  var themeIndex = seed % terminalThemeOrder.length;
  return terminalThemeOrder[themeIndex];
}

function getWeekOfYear(date) {
  var startOfYear = new Date(date.getFullYear(), 0, 1);
  var daysSinceStart = Math.floor((date - startOfYear) / 86400000);
  return Math.floor((daysSinceStart + startOfYear.getDay()) / 7) + 1;
}

function setTheme(themeName, persist) {
  if (!terminalThemes[themeName]) {
    return false;
  }

  if (persist === undefined) {
    persist = true;
  }

  document.body.setAttribute("data-theme", themeName);
  if (persist) {
    localStorage.setItem("terminal-theme", themeName);
  }
  return true;
}

function resolveThemeArg(arg) {
  if (!arg) {
    return null;
  }

  if (terminalThemes[arg]) {
    return arg;
  }

  var numericChoice = parseInt(arg, 10);
  if (Number.isNaN(numericChoice)) {
    return null;
  }

  var themeIndex = numericChoice - 1;
  if (themeIndex < 0 || themeIndex >= terminalThemeOrder.length) {
    return null;
  }

  return terminalThemeOrder[themeIndex];
}

function newTab(link) {
  setTimeout(function () {
    window.open(link, "_blank");
  }, 500);
}

function addLine(text, style, time) {
  var t = "";
  for (let i = 0; i < text.length; i++) {
    if (text.charAt(i) == " " && text.charAt(i + 1) == " ") {
      t += "&nbsp;&nbsp;";
      i++;
    } else {
      t += text.charAt(i);
    }
  }
  setTimeout(function () {
    var next = document.createElement("p");
    next.innerHTML = t;
    next.className = style;

    before.parentNode.insertBefore(next, before);

    window.scrollTo(0, document.body.offsetHeight);
  }, time);
}

function loopLines(name, style, time) {
  name.forEach(function (item, index) {
    addLine(item, style, index * time);
  });
}
