'use client'
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'

export type ToastType = 'success' | 'error'
const TOAST_DURATION = 4000 // milissegundos

interface ToastContextType {
  showSuccess: (msg: string) => void
  showError: (msg: string) => void
}
const ToastContext = createContext<ToastContextType>({
  showSuccess: () => {},
  showError: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()!
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: ToastType }[]
  >([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => setToasts([]), [pathname])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id = globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : Math.random().toString(36).slice(2)

      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        removeToast(id)
      }, TOAST_DURATION)
    },
    [removeToast],
  )

  const showSuccess = useCallback(
    (msg: string) => addToast(msg, 'success'),
    [addToast],
  )
  const showError = useCallback(
    (msg: string) => addToast(msg, 'error'),
    [addToast],
  )

  const portal = (
    <div className="fixed inset-x-0 top-6 flex flex-col items-center z-[9999] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-5 py-3 min-w-[200px] max-w-xs rounded-2xl shadow-lg mb-2 
            bg-white/80 backdrop-blur border border-gray-200 pointer-events-auto
            transition-all duration-500 animate-slideIn
            ${
              t.type === 'success'
                ? 'border-green-400 text-green-800'
                : 'border-red-400 text-red-800'
            }
          `}
          style={{
            boxShadow: '0 8px 24px 0 rgb(0 0 0 / 8%)',
          }}
          tabIndex={0}
          role="alert"
        >
          <span>
            {t.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </span>
          <span className="flex-1">{t.message}</span>
          <button
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => removeToast(t.id)}
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      ))}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateY(-40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      {mounted && createPortal(portal, document.body)}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
