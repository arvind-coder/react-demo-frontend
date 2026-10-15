import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { ApiRequestError } from "../services/api";
import { getUserById } from "../services/userService";
import type { User } from "../types/user";

// DEMO ONLY: keep the loading spinner visible for at least this long, so the loading state can be
// shown in a training session even though the local API answers in a few milliseconds.
// Set it to 0 to remove the artificial delay. Never do this in a real app.
const MIN_LOADING_MS = 1000;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * PAGE for route:  /users/:id      (defined in App.tsx)
 *
 * HOW THE ID TRAVELS FROM THE BROWSER URL TO THE DATABASE:
 *   1. In the list, <Link to={`/users/${user._id}`}> changes the URL to /users/665f1c2e8b3a4d0012345678
 *   2. React Router matches the route "/users/:id" and renders this page.
 *   3. useParams() gives us { id: "665f1c2e8b3a4d0012345678" } (like Express's req.params).
 *   4. userService.getUserById(id) calls  GET http://localhost:5000/api/users/665f1c2e8b3a4d0012345678
 *   5. Express matches "/:id", reads req.params.id, and Mongoose runs User.findById(id).
 *
 * Because the id is in the URL, this page can be bookmarked, shared or refreshed and still works.
 */
export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Runs after the first render, and again ONLY if `id` changes (it is in the dependency array).
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    // Promise.all waits for BOTH: the real API call and the minimum delay. So the spinner stays for
    // max(API time, 2 seconds). If the API call fails, the error also appears after the delay.
    Promise.all([getUserById(id, controller.signal), wait(MIN_LOADING_MS)])
      .then(([response]) => setUser(response.data))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiRequestError && err.status === 404) setError("This user does not exist (it may have been deleted).");
        else if (err instanceof ApiRequestError && err.status === 400) setError(err.message);
        else setError(err instanceof ApiRequestError ? err.message : "Could not load the user.");
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [id]);

  // CONDITIONAL RENDERING: exactly one of these is shown.
  let content;
  if (isLoading) content = <LoadingSpinner label="Loading user..." />;
  else if (error || !user) content = <ErrorMessage message={error ?? "User not found."} />;
  else {
    const rows: [string, string][] = [
      ["Name", user.name],
      ["Email", user.email],
      ["Phone", user.phone],
      ["Department", user.department],
      ["Created", new Date(user.createdAt).toLocaleString()],
      ["Last updated", new Date(user.updatedAt).toLocaleString()],
      ["ID", user._id],
    ];
    content = (
      <dl className="divide-y divide-slate-100 px-5">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-3 gap-2 py-3 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="col-span-2 break-all font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">User details</h2>
        <div className="flex gap-2">
          <Link to="/users" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">← Back to list</Link>
          {/* Only offer Edit when the user was actually loaded. */}
          {user && !error && <Link to={`/users/${user._id}/edit`} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Edit</Link>}
        </div>
      </div>
      {content}
    </section>
  );
}
