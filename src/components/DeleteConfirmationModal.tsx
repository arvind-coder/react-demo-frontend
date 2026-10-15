import type { User } from "../types/user";
import Modal from "./Modal";

interface DeleteConfirmationModalProps {
  user: User;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Asks "Are you sure?" before the destructive DELETE request.
 * The actual API call happens in App (onConfirm); this component only displays state it is given.
 */
export default function DeleteConfirmationModal({ user, isDeleting, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  return (
    <Modal title="Delete user" onClose={isDeleting ? () => undefined : onCancel}>
      <p className="text-sm text-slate-600">
        Are you sure you want to delete <strong className="text-slate-900">{user.name}</strong> ({user.email})? This cannot be undone.
      </p>
      <div className="flex justify-end gap-2 pt-5">
        <button onClick={onCancel} disabled={isDeleting} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Cancel</button>
        {/* Disabled while the request is running so a double click cannot send DELETE twice. */}
        <button onClick={onConfirm} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
