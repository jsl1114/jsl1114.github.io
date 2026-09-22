import { Lock } from "lucide-react";

const AdminLogin = ({ password, setPassword, handleLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 w-full max-w-md mx-auto">
      <div className="glass p-8 rounded-2xl w-full">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-black/5 dark:bg-white/10 rounded-full">
            <Lock className="w-6 h-6 text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]" />
          </div>
        </div>
        <h2 className="text-3xl text-center mb-6 text-neutral-900 dark:text-white">
          Admin Access
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-2.5 rounded-lg glass text-neutral-900 dark:text-white outline-none transition-colors focus:border-black/50 dark:focus:border-white/50"
          />
          <button
            type="submit"
            className="pill w-full py-3"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
