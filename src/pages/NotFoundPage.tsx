import { Link } from "react-router-dom";

/** Shown for any URL that no <Route> matched (the "*" route in App.tsx). Not related to the API's 404. */
export default function NotFoundPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-16 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Page not found</h2>
      <p className="mt-1 text-sm text-slate-500">The page you are looking for does not exist.</p>
      <Link to="/users" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Go to users</Link>
    </div>
  );
}
