import { useEffect } from "react";

export interface ToastMessage {
  id: number;
  type: "success" | "error" | "info";
  text: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

const STYLES: Record<ToastMessage["type"], string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

/** One notification that removes itself after 4 seconds. */
function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  // useEffect + cleanup: start a timer when the toast appears; clear it if the toast disappears
  // earlier (e.g. user clicks x), otherwise the timer would fire on something that no longer exists.
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    // role="alert" makes screen readers announce errors immediately; role="status" is polite.
    <div role={toast.type === "error" ? "alert" : "status"} className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${STYLES[toast.type]}`}>
      <span>{toast.text}</span>
      <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification" className="font-bold leading-none opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

/** Fixed stack of toasts in the bottom-right corner (not top, so they never cover the navbar buttons). */
export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
