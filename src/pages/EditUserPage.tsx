import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import UserForm from "../components/UserForm";
import { useToast } from "../context/ToastContext";
import { ApiRequestError } from "../services/api";
import { getUserById, updateUser } from "../services/userService";
import type { CreateUserPayload, UpdateUserPayload, User } from "../types/user";

/**
 * PAGE for route:  /users/:id/edit      (defined in App.tsx)
 *
 * FLOW
 *   1. useParams() reads the id from the URL.
 *   2. useEffect -> GET /api/users/:id to load the current data (so the form can be prefilled,
 *      even if you open this URL directly or refresh the page).
 *   3. UserForm shows the prefilled controlled inputs.
 *   4. Submit -> PATCH /api/users/:id with ONLY the changed fields.
 *   5. On success: show a toast and navigate("/users") - the list page re-fetches fresh data.
 *
 * PATCH vs PUT: PATCH changes only the fields we send; PUT would replace the whole user.
 */
export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // function to change the URL from code (after a successful save)
  const { notify } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    getUserById(id, controller.signal)
      .then((response) => setUser(response.data))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiRequestError && err.status === 404) setError("This user does not exist (it may have been deleted).");
        else if (err instanceof ApiRequestError && err.status === 400) setError("The user id in the URL is invalid.");
        else setError(err instanceof ApiRequestError ? err.message : "Could not load the user.");
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [id]);

  /** Called by UserForm on submit. If it throws, the form stays open and shows the error. */
  const handleSubmit = async (values: CreateUserPayload) => {
    if (!user) return;

    // Build an object containing ONLY the modified fields - this is what PATCH is for.
    const changes: UpdateUserPayload = {};
    (Object.keys(values) as (keyof CreateUserPayload)[]).forEach((key) => {
      if (values[key].trim() !== user[key]) changes[key] = values[key].trim();
    });
    if (Object.keys(changes).length === 0) {
      notify("info", "No changes to save.");
      navigate("/users");
      return;
    }

    try {
      await updateUser(user._id, changes);
      notify("success", "User updated successfully.");
      navigate("/users"); // go back to the list (the router swaps the page; the list re-fetches)
    } catch (err) {
      notify("error", err instanceof ApiRequestError ? err.message : "Unexpected error.");
      if (err instanceof ApiRequestError && err.status === 404) {
        navigate("/users"); // user vanished meanwhile; nothing left to edit
        return;
      }
      throw err; // let UserForm display field-level errors (e.g. duplicate email)
    }
  };

  let content;
  if (isLoading) content = <LoadingSpinner label="Loading user..." />;
  else if (error || !user) content = <ErrorMessage message={error ?? "User not found."} />;
  else content = <div className="px-5 py-4"><UserForm user={user} onSubmit={handleSubmit} onCancel={() => navigate(`/users/${user._id}`)} /></div>;

  return (
    <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Edit user</h2>
        <Link to="/users" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">← Back to list</Link>
      </div>
      {content}
    </section>
  );
}
