import { Link } from "react-router-dom";
import type { User } from "../types/user";

interface UserTableProps {
  users: User[];
  onDelete: (user: User) => void;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

/**
 * Renders the users as a table. It holds no state: it receives data and callbacks via props
 * ("presentational component"), which makes it easy to understand and reuse.
 *
 * View and Edit are <Link>s to other ROUTES (see App.tsx); only Delete is a button because it
 * does not change the page, it opens a confirmation dialog on the list page.
 *
 * Responsive: Phone is hidden below `md`, Created below `lg`; on small screens the email is
 * shown under the name so no information is lost.
 */
export default function UserTable({ users, onDelete }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Name</th>
            <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Email</th>
            <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Phone</th>
            <th scope="col" className="px-4 py-3 font-medium">Department</th>
            <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Created</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {/*
            .map() turns each user object into a <tr>. The `key` must be unique and STABLE (the
            database _id). Keys let React tell which row was added, removed or changed, so it
            updates only that row. Using the array index would mix up rows after a delete.
          */}
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="truncate text-xs text-slate-500 sm:hidden">{user.email}</div>
              </td>
              <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{user.email}</td>
              <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{user.phone}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">{user.department}</span>
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 lg:table-cell">{formatDate(user.createdAt)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {/* The dynamic id is placed into the URL: /users/<_id> and /users/<_id>/edit. aria-label gives each link a unique name. */}
                <Link to={`/users/${user._id}`} aria-label={`View ${user.name}`} className="inline-block rounded px-2 py-1 text-slate-600 hover:bg-slate-100">View</Link>
                {/* <a href={`/users/${user._id}`} aria-label={`View ${user.name}`} className="inline-block rounded px-2 py-1 text-slate-600 hover:bg-slate-100">View</a> */}
                <Link to={`/users/${user._id}/edit`} aria-label={`Edit ${user.name}`} className="inline-block rounded px-2 py-1 text-indigo-600 hover:bg-indigo-50">Edit</Link>
                <button onClick={() => onDelete(user)} aria-label={`Delete ${user.name}`} className="rounded px-2 py-1 text-red-600 hover:bg-red-50">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
