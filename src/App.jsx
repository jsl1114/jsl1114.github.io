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

const RouteFrame = ({ location, positions, children }) => {
  useLayoutEffect(() => {
    const scrollPositions = positions.current;
    const saved = scrollPositions.get(location.key);
    const section =
      location.hash && document.getElementById(location.hash.slice(1));
    window.scrollTo({
      top: saved ?? (section ? section.offsetTop : 0),
      behavior: "instant",
    });
    return () => scrollPositions.set(location.key, window.scrollY);
  }, [location.key, location.hash, positions]);

  return children;
};

const PageRoutes = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const positions = useRef(new Map());
  const [projectsOpen, setProjectsOpen] = useState(false);
  const transition = {
    direction: location.pathname.startsWith("/work/") ? 1 : -1,
    reduceMotion,
  };

  useEffect(() => {
    hasNavigated = true;
  }, []);

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
