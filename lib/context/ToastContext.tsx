"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

export type ToastType = "success" | "error";

interface ToastContextType {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showSuccess: () => {},
  showError: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: ToastType }[]
  >([]);
  const pathname = usePathname();
  useEffect(() => setToasts([]), [pathname]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const showSuccess = useCallback(
    (msg: string) => addToast(msg, "success"),
    [addToast]
  );
  const showError = useCallback(
    (msg: string) => addToast(msg, "error"),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
      }}
    >
      {children}
      {mounted &&
        createPortal(
          <div className="fixed top-4 right-4 space-y-2 z-50">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`px-4 py-2 rounded text-white shadow ${
                  t.type === "success" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {t.message}
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
