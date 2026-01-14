import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";

import AdminLogin from "./AdminLogin";
import AdminMessageItem from "./AdminMessageItem";
import AdminPageNav from "./AdminPageNav";

const AdminMessages = () => {
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const copiedTimeoutRef = useRef(null);

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
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session) {
      try {
        const { timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setIsAuthenticated(true);
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
      await axiosInstance.delete(`/messages/${id}`);
      refetch();
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
    } else {
      alert("Incorrect password");
    }
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["messages", page, limit, search],
    queryFn: async () => {
      const res = await axiosInstance.get(`/messages`, {
        params: { page, limit, search },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const messages = data?.messages || [];
  const meta = data?.meta || {};

  if (!isAuthenticated) {
    return (
      <AdminLogin
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
    );
  }

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );

  if (isError) return <div>Error fetching messages</div>;

  return (
    <div className="w-full p-3 min-w-0">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Messages ({meta.msgCount})
        </h2>
        <button
          onClick={() => refetch()}
          className="hover:cursor-pointer p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw
            className={`w-5 h-5 text-neutral-600 dark:text-neutral-400 ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>
      <div className="mb-4">
        <AdminPageNav
          limit={limit}
          setLimit={setLimit}
          page={page}
          setPage={setPage}
          totalPages={meta.totalPages || 1}
          search={search}
          setSearch={(s) => {
            setSearch(s);
            setPage(1);
          }}
        />
      </div>
      {messages.length === 0 ? (
        <div className="text-center p-10 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
          No messages found.
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <AdminMessageItem
              key={msg.id}
              msg={msg}
              handleCopyEmail={handleCopyEmail}
              copiedMessageId={copiedMessageId}
              deleteMessage={deleteMessage}
              searchQuery={search}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
