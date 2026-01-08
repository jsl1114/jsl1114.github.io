import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

const ShortcutHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
