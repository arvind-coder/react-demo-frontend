interface LoadingSpinnerProps {
  /** Text announced to screen readers and shown beside the spinner. */
  label?: string;
}

/**
 * A small reusable spinner. PROPS are the inputs of a component (like function arguments);
 * a component re-renders whenever its props or state change.
 */
export default function LoadingSpinner({ label = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-12 text-slate-500">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
