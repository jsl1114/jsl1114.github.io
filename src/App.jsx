import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import ReactGA from "react-ga4";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PageBackground from "./components/PageBackground";

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
