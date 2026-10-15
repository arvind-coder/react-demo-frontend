interface EmptyStateProps {
  title: string;
  description: string;
  /** Optional call-to-action button (e.g. "Add User"). */
  actionLabel?: string;
  onAction?: () => void;
}

/** Shown when the request succeeded but there is nothing to display. */
export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl text-indigo-600" aria-hidden="true">👤</div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
