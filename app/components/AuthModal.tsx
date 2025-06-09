"use client";

import { useState } from "react";
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
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
      </div>
    </div>
  );
}
