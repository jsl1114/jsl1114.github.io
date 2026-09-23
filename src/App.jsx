import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ReactGA from "react-ga4";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PageBackground from "./components/PageBackground";
import ProjectDetail from "./pages/ProjectDetail";

const pageVariants = {
  enter: ({ direction, reduceMotion }) => ({
    x: reduceMotion ? 0 : `${direction * 100}vw`,
    opacity: reduceMotion ? 1 : 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: ({ direction, reduceMotion }) => ({
    x: reduceMotion ? 0 : `${direction * -30}vw`,
    opacity: 0,
    transition: { duration: reduceMotion ? 0 : 0.22, ease: "easeIn" },
  }),
};

// The first page paints in place; only later navigations slide. This lives on
// the page wrapper rather than as AnimatePresence initial={false}, which would
// also suppress every nested entrance animation on first load.
let hasNavigated = false;

// Scroll positions survive a refresh or a back/forward into the site through
// sessionStorage. A fresh visit (typed URL, new link) starts from the top.
const SCROLL_KEY = "scroll-positions";
const PROJECTS_OPEN_KEY = "projects-open";

const [navEntry] = performance.getEntriesByType("navigation");
const isReturnVisit =
  navEntry?.type === "reload" || navEntry?.type === "back_forward";

const readStored = (key) => {
  if (!isReturnVisit) return null;
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
};

const writeStored = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); restoring is best-effort.
  }
};

const RouteFrame = ({ location, positions, children }) => {
  useLayoutEffect(() => {
    const scrollPositions = positions.current;
    const saved = scrollPositions.get(location.key);
    const section =
      location.hash && document.getElementById(location.hash.slice(1));
    const restore = () =>
      window.scrollTo({
        top: saved ?? (section ? section.offsetTop : 0),
        behavior: "instant",
      });
    restore();

    // After a refresh the web font and images land after this first scroll and
    // push content down, so scroll again once they have, unless the visitor
    // has already started scrolling.
    const inputs = ["wheel", "touchstart", "keydown", "mousedown"];
    let settled = saved == null || document.readyState === "complete";
    const settle = () => (settled = true);
    const reapply = () => settled || restore();
    if (!settled) {
      inputs.forEach((e) => window.addEventListener(e, settle, { passive: true }));
      document.fonts.ready.then(reapply);
      window.addEventListener("load", reapply);
    }

    const persist = () => {
      scrollPositions.set(location.key, window.scrollY);
      writeStored(SCROLL_KEY, [...scrollPositions]);
    };
    window.addEventListener("pagehide", persist);
    return () => {
      settle();
      inputs.forEach((e) => window.removeEventListener(e, settle));
      window.removeEventListener("load", reapply);
      window.removeEventListener("pagehide", persist);
      scrollPositions.set(location.key, window.scrollY);
    };
  }, [location.key, location.hash, positions]);

  return children;
};

const PageRoutes = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const positions = useRef(null);
  if (!positions.current) positions.current = new Map(readStored(SCROLL_KEY));
  const [projectsOpen, setProjectsOpen] = useState(
    () => readStored(PROJECTS_OPEN_KEY) === true,
  );
  const transition = {
    direction: location.pathname.startsWith("/work/") ? 1 : -1,
    reduceMotion,
  };

  useEffect(() => {
    hasNavigated = true;
  }, []);

  useEffect(() => {
    writeStored(PROJECTS_OPEN_KEY, projectsOpen);
  }, [projectsOpen]);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  return (
    <AnimatePresence mode="wait" custom={transition}>
      <motion.div
        key={location.pathname}
        custom={transition}
        variants={pageVariants}
        initial={hasNavigated ? "enter" : false}
        animate="visible"
        exit="exit"
      >
        <RouteFrame location={location} positions={positions}>
          <Routes location={location}>
            <Route
              path="/"
              element={
                <Home
                  projectsOpen={projectsOpen}
                  onProjectsOpenChange={setProjectsOpen}
                />
              }
            />
            <Route path="/work/:slug" element={<ProjectDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RouteFrame>
      </motion.div>
    </AnimatePresence>
  );
};

const ShortcutHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle admin view with Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        if (location.pathname === "/admin") {
          navigate("/");
        } else {
          navigate("/admin");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, location]);

  return null;
};

function App() {
  return (
    <Router>
      <ShortcutHandler />
      <div className="relative w-full overflow-x-hidden text-neutral-800 dark:text-neutral-300 antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900 bg-transparent dark:bg-transparent transition-colors duration-300 min-h-screen">
        <PageBackground />
        <PageRoutes />
      </div>
    </Router>
  );
}

export default App;
