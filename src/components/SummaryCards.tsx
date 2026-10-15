import type { User } from "../types/user";

interface SummaryCardsProps {
  users: User[];
}

/**
 * Total users + per-department counts.
 * These numbers are DERIVED from `users`, so they are computed during render instead of being stored
 * in their own state. Rule of thumb: if you can calculate it from existing state, don't duplicate it.
 * When `users` changes (add/delete), React re-renders and these cards update automatically.
 */
export default function SummaryCards({ users }: SummaryCardsProps) {
  const counts = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.department] = (acc[user.department] ?? 0) + 1;
    return acc;
  }, {});
  const departments = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <div className="rounded-xl border border-indigo-100 bg-indigo-600 p-4 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-indigo-100">Total users</p>
        <p className="mt-1 text-3xl font-bold">{users.length}</p>
      </div>
      {/* key must be unique and stable among siblings so React can match items between renders. */}
      {departments.slice(0, 7).map(([department, count]) => (
        <div key={department} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="truncate text-xs uppercase tracking-wide text-slate-500">{department}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{count}</p>
        </div>
      ))}
    </section>
  );
}
