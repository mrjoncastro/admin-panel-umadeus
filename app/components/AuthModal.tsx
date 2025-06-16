"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

export default function AuthModal({
  open,
  onClose,
  defaultView = "login",
}: {
  open: boolean;
  onClose: () => void;
  defaultView?: "login" | "signup";
}) {
  const [view, setView] = useState<"login" | "signup">(defaultView);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl shadow-xl w-full max-w-md relative"
              >
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 text-xl leading-none"
                  aria-label="Fechar"
                >
                  &times;
                </button>
                <div className="flex justify-center gap-4 mb-4">
                  <button
                    onClick={() => setView("login")}
                    className={`px-4 py-1 rounded-full text-sm ${view === "login" ? "bg-black text-white" : "bg-neutral-200"}`}
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => setView("signup")}
                    className={`px-4 py-1 rounded-full text-sm ${view === "signup" ? "bg-black text-white" : "bg-neutral-200"}`}
                  >
                    Criar conta
                  </button>
                </div>
                {view === "login" ? <LoginForm /> : <SignUpForm onSuccess={onClose} />}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
