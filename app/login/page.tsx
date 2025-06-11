"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";
import LayoutWrapper from "../components/LayoutWrapper";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view") === "signup" ? "signup" : "login";
  const [view, setView] = useState<"login" | "signup">(initial);

  useEffect(() => {
    setView(initial);
  }, [initial]);

  const redirectTo = searchParams.get("redirect") || undefined;

  return (
    <LayoutWrapper>
      <div className="max-w-md mx-auto my-12 p-6 bg-white dark:bg-neutral-900 rounded-xl shadow space-y-6">
        <div className="flex justify-center gap-4">
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
        {view === "login" ? (
          <LoginForm redirectTo={redirectTo} />
        ) : (
          <SignUpForm onSuccess={() => setView("login") } />
        )}
      </div>
    </LayoutWrapper>
  );
}
