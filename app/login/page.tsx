"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppConfig } from "@/lib/context/AppConfigContext";
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";
import LayoutWrapper from "../components/LayoutWrapper";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}

function LoginClient() {
  "use client";
  const searchParams = useSearchParams();
  const { config } = useAppConfig();
  const initial = searchParams.get("view") === "signup" ? "signup" : "login";
  const [view, setView] = useState<"login" | "signup">(initial);
  const redirectTo = searchParams.get("redirect") || undefined;

  useEffect(() => {
    setView(initial);
  }, [initial]);

  return (
    <LayoutWrapper>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col justify-center items-center px-6 md:px-8 py-6 text-[var(--text-primary)]">
          <div className="w-full">
            {/* Formulário */}
            <div>
              {view === "login" ? (
                <LoginForm redirectTo={redirectTo}>
                  Ainda não tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => setView("signup")}
                    className="underline hover:text-[var(--accent)] transition"
                  >
                    Crie uma agora
                  </button>
                </LoginForm>
              ) : (
                <SignUpForm onSuccess={() => setView("login")}>
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="underline text-white hover:text-[var(--accent)] transition"
                  >
                    Faça login
                  </button>
                </SignUpForm>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}

// Opcional: animação de digitação (caso use em outro local)
function TypingEffect({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text[i]);
      i++;
      if (i === text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayedText}</span>;
}
