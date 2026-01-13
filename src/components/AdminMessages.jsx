import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Trash2, RefreshCw, Lock, Copy, Check } from "lucide-react";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const copiedTimeoutRef = useRef(null);

  const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

  // Simple hardcoded password for basic protection
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current)
        window.clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const copyToClipboard = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall back below
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopyEmail = async (messageId, email) => {
    if (!email) return;

    const success = await copyToClipboard(email);
    if (!success) {
      alert("Unable to copy email to clipboard");
      return;
    }

    setCopiedMessageId(messageId);
    if (copiedTimeoutRef.current) window.clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = window.setTimeout(() => {
      setCopiedMessageId(null);
    }, 1200);
  };

  const getAuthHeader = () => {
    const session = JSON.parse(localStorage.getItem("admin_session") || "{}");
    // If we have text in the password input (just logged in), use it.
    // Otherwise fallback to session storage.
    const authPassword = password || session.password;
    return { "x-admin-password": authPassword };
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${serverEndpoint}/messages`, {
        headers: getAuthHeader(),
      });
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("admin_session");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session) {
      try {
        const { timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setIsAuthenticated(true);
          // fetchMessages will be called but we need to ensure it uses the session password
          // We can't call fetchMessages() here directly if it depends on state that isn't set yet,
          // but since we read from localStorage in getAuthHeader, it's fine.
          setTimeout(fetchMessages, 0);
        } else {
          localStorage.removeItem("admin_session");
        }
      } catch {
        localStorage.removeItem("admin_session");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      await axios.delete(`${serverEndpoint}/messages/${id}`, {
        headers: getAuthHeader(),
      });
      setMessages(messages.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("admin_session");
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(
        "admin_session",
        JSON.stringify({ timestamp: Date.now(), password: password }),
      );
      fetchMessages();
    } else {
      alert("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-10 w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 w-full">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full">
              <Lock className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-6 text-neutral-900 dark:text-white">
            Admin Access
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-3 min-w-0">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Messages ({messages.length})
        </h2>
        <button
          onClick={fetchMessages}
          className="hover:cursor-pointer p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw
            className={`w-5 h-5 text-neutral-600 dark:text-neutral-400 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center p-10 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
          No messages found.
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow min-w-0"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.defaultPrevented) return;
                if (e.key === "c" || e.key === "C") {
                  e.preventDefault();
                  handleCopyEmail(msg.id, msg.email);
                }
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2 min-w-0">
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                      {msg.name}
                    </h3>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      •
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {new Date(msg.createdAt).toLocaleDateString()}{" "}
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3 min-w-0">
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline break-all min-w-0"
                    >
                      {msg.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(msg.id, msg.email)}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer shrink-0"
                      title="Copy email (or press C while focused)"
                      aria-label={`Copy ${msg.email} to clipboard`}
                    >
                      {copiedMessageId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed break-words">
                    {msg.message}
                  </p>
                </div>
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors hover:cursor-pointer self-end sm:self-auto bg-red-50 dark:bg-red-900/20 w-full sm:w-auto sm:bg-transparent dark:sm:bg-transparent flex items-center justify-center sm:flex-none mt-3 sm:mt-0"
                  title="Delete message"
                >
                  <Trash2 className="w-5 h-5" />
                  <div className="pl-1 sm:hidden">Delete</div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
