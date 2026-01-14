import { Lock } from "lucide-react";

const AdminLogin = ({ password, setPassword, handleLogin }) => {
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
};

export default AdminLogin;
