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
  const pathname = usePathname();
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: ToastType }[]
  >([]);
  const [mounted, setMounted] = useState(false);

  // marca que está montado (para usar createPortal com segurança)
  useEffect(() => {
    setMounted(true);
  }, []);

  // limpa ao navegar
  useEffect(() => {
    setToasts([]);
  }, [pathname]);

  const addToast = useCallback((message: string, type: ToastType) => {
    console.log("🆕 [ToastProvider] addToast chamado com:", { message, type });
    const id = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2);

    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      console.log("📋 [ToastProvider] state toasts após adicionar:", next);
      return next;
    });

    setTimeout(() => {
      setToasts((prev) => {
        const next = prev.filter((toast) => toast.id !== id);
        console.log(
          "⏱ [ToastProvider] removendo toast",
          id,
          "→ novo state:",
          next
        );
        return next;
      });
    }, 3000);
  }, []);

  const showSuccess = useCallback(
    (msg: string) => {
      console.log("✅ [ToastProvider] showSuccess:", msg);
      addToast(msg, "success");
    },
    [addToast]
  );

  const showError = useCallback(
    (msg: string) => {
      console.log("❌ [ToastProvider] showError:", msg);
      addToast(msg, "error");
    },
    [addToast]
  );

  // debug de render
  console.log("🖥️ [ToastProvider.render] toasts atuais:", toasts);

  // container dos toasts via portal
  const portal = (
    <div className="fixed top-4 right-4 space-y-2 z-[9999] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-2 rounded text-white shadow ${
            t.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      {mounted && createPortal(portal, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
