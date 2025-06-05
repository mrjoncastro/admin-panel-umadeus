"use client";
import { createContext, useContext, useState, useCallback } from "react";

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

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = crypto.randomUUID();
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
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
