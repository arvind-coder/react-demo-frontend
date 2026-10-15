import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import ToastContainer, { ToastMessage } from "../components/Toast";

/**
 * CONTEXT = a way to share data with ANY component below a provider without passing props through
 * every level ("prop drilling").
 *
 * WHY HERE: with routes, each page is a separate component. The list page, the edit page and the
 * details page all need to show toasts, and a toast must survive navigation (e.g. "User updated"
 * is raised on the edit page but is still visible after we navigate back to the list).
 * So the toast state lives in this provider, which wraps the whole app (see main.tsx).
 *
 * USAGE in any component:   const { notify } = useToast();   notify("success", "Saved!");
 */
interface ToastContextValue {
  notify: (type: ToastMessage["type"], text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((t) => t.id !== id)), []);
  const notify = useCallback(
    (type: ToastMessage["type"], text: string) =>
      setToasts((current) => [...current, { id: Date.now() + Math.random(), type, text }]),
    []
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
