import { useNavigate } from "react-router-dom";
import AdminMessages from "../components/AdminMessages";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-lg bg-neutral-200 px-4 py-2 font-medium text-neutral-900 hover:opacity-80 hover:cursor-pointer dark:bg-neutral-800 dark:text-white w-full sm:w-auto"
          >
            ← Back to Site
          </button>
        </div>

        <div className="w-full">
          <AdminMessages />
        </div>
      </div>
    </div>
  );
};

export default Admin;
