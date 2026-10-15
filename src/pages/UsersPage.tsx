import { useCallback, useMemo, useState } from "react";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import SummaryCards from "../components/SummaryCards";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../hooks/useUsers";
import { ApiRequestError } from "../services/api";
import type { CreateUserPayload, User } from "../types/user";

/**
 * PAGE for route:  /users
 *
 * Owns the list screen: summary cards, search, table, Add (modal) and Delete (confirm dialog).
 * View and Edit are NOT modals anymore: they are separate routes, reached with <Link> in UserTable
 * (/users/:id and /users/:id/edit).
 *
 * WHAT HAPPENS ON EACH BUTTON
 *  - Add User : setIsFormOpen(true)       -> form modal -> POST /api/users on submit
 *  - View     : <Link to="/users/ID">     -> router shows UserDetailsPage -> GET /api/users/:id
 *  - Edit     : <Link to="/users/ID/edit">-> router shows EditUserPage    -> PATCH /api/users/:id
 *  - Delete   : setDeleteTarget(user)     -> confirm dialog -> DELETE /api/users/:id on confirm
 *
 * Because this component is mounted each time you navigate to /users, the useUsers hook fetches a
 * fresh list every time you come back (e.g. after editing a user), so the table is never stale.
 */
export default function UsersPage() {
  const { users, isLoading, error, refresh, createUser, deleteUser } = useUsers();
  const { notify } = useToast();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---------- Search (FRONTEND filtering) ----------
  // The full list was already downloaded by GET /api/users, so we filter it in the browser.
  // Fast and simple for small data. With thousands of users you would instead send the term to the
  // backend (GET /api/users?search=rahul) and let MongoDB filter and paginate.
  // useMemo re-computes only when `users` or `search` change.
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
  }, [users, search]);

  // ---------- Handlers ----------
  /** Called by UserForm. Throwing keeps the modal open so the form can show the error. */
  const handleCreate = async (values: CreateUserPayload) => {
    try {
      await createUser(values);
      notify("success", "User created successfully.");
      setIsFormOpen(false); // close the modal only after the server confirmed success
    } catch (err) {
      notify("error", err instanceof ApiRequestError ? err.message : "Unexpected error.");
      throw err; // let UserForm display field-level errors (e.g. duplicate email)
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget._id);
      notify("success", `${deleteTarget.name} was deleted.`);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        notify("error", "This user no longer exists. The list has been refreshed.");
        void refresh(); // someone else deleted it; sync our list with the server
      } else {
        notify("error", err instanceof ApiRequestError ? err.message : "Could not delete the user.");
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Stable function identities so Modal's props don't change on every render.
  const closeForm = useCallback(() => setIsFormOpen(false), []);
  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  // ---------- What to show inside the table card ----------
  // CONDITIONAL RENDERING: loading -> error -> empty -> no search match -> table.
  let tableArea;
  if (isLoading && users.length === 0) tableArea = <LoadingSpinner label="Loading users..." />;
  else if (error && users.length === 0) tableArea = <ErrorMessage message={error} onRetry={refresh} />;
  else if (users.length === 0) tableArea = <EmptyState title="No users yet" description="Add your first user to see it appear here." actionLabel="Add User" onAction={() => setIsFormOpen(true)} />;
  else if (filteredUsers.length === 0) tableArea = <EmptyState title="No matches" description={`No user matches "${search}".`} />;
  else tableArea = <UserTable users={filteredUsers} onDelete={setDeleteTarget} />;

  return (
    <>
      <SummaryCards users={users} />

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Users</h2>
            <p className="text-xs text-slate-500">Showing {filteredUsers.length} of {users.length}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Controlled search input: the text lives in state; each keystroke re-filters the list. */}
            <label htmlFor="search" className="sr-only">Search users by name or email</label>
            <input id="search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:w-64 sm:flex-none" />
            <button onClick={() => void refresh()} disabled={isLoading} className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <button onClick={() => setIsFormOpen(true)} className="whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
              + Add User
            </button>
          </div>
        </div>
        {/* A failed REFRESH keeps the old rows visible and shows a banner above them. */}
        {error && users.length > 0 && <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
        {tableArea}
      </section>

      {/* Modals are rendered only while their state is set (conditional rendering). */}
      {isFormOpen && (
        <Modal title="Add user" onClose={closeForm}>
          <UserForm onSubmit={handleCreate} onCancel={closeForm} />
        </Modal>
      )}
      {deleteTarget && <DeleteConfirmationModal user={deleteTarget} isDeleting={isDeleting} onConfirm={handleConfirmDelete} onCancel={cancelDelete} />}
    </>
  );
}
