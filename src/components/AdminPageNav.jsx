import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const mppOptions = [
  { value: "5", label: "5 per page" },
  { value: "10", label: "10 per page" },
  { value: "15", label: "15 per page" },
  { value: "20", label: "20 per page" },
];

const AdminPageNav = ({
  limit,
  setLimit,
  page,
  setPage,
  totalPages,
  search,
  setSearch,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div className="relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 pr-3 py-1.5 text-sm rounded-full glass outline-none transition-colors focus:border-black/50 dark:focus:border-white/50 w-full sm:w-64"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] whitespace-nowrap">
          page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] whitespace-nowrap"></div>
            <select
              value={String(limit)}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-transparent border border-black/10 dark:border-white/[.08] rounded-full px-3 py-1 text-sm outline-none transition-colors focus:border-black/50 dark:focus:border-white/50"
            >
              {mppOptions.map(({ value, label }) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="First page"
            >
              <ChevronFirst className="w-5 h-5 text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-5 h-5 text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Last page"
            >
              <ChevronLast className="w-5 h-5 text-[var(--color-muted)] dark:text-[var(--color-muted-dark)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminPageNav;
