interface ErrorMessageProps {
  message: string;
  /** When provided, a Retry button is shown. */
  onRetry?: () => void;
}

/** Shows an error (network failure, 404, 500...) with an optional retry action. */
export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl text-red-600" aria-hidden="true">!</div>
      <p className="max-w-md text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Try again
        </button>
      )}
    </div>
  );
}
