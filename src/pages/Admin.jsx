import { useNavigate } from "react-router-dom";
import AdminMessages from "../components/AdminMessages";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white p-8 min-h-screen min-h-[100svh] min-h-[100dvh]">
      <button
        onClick={() => navigate("/")}
        className="mb-8 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg hover:opacity-80 hover:cursor-pointer"
      >
        ← Back to Site
      </button>
      <AdminMessages />
    </div>
  );
};

export default Admin;
