import { Link, NavLink } from "react-router-dom";

/**
 * Top navigation bar, shown on every page (see Layout in App.tsx).
 * <Link>/<NavLink> change the URL without reloading the page. A plain <a href> would reload the
 * whole app. NavLink also tells us whether it is the current page (isActive) so we can highlight it.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/users" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white" aria-hidden="true">U</div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-slate-900">User Management</h1>
            <p className="hidden text-xs text-slate-500 sm:block">React + Express + MongoDB training demo</p>
          </div>
        </Link>
        <nav aria-label="Main">
          <NavLink
            to="/users"
            className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Users
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
