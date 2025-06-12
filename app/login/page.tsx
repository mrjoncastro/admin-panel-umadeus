"use client";

import { Suspense, useEffect, useState } from "react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}

import { useSearchParams } from "next/navigation";
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";
import LayoutWrapper from "../components/LayoutWrapper";

function LoginClient() {
  "use client";
  const searchParams = useSearchParams();
  const initial = searchParams.get("view") === "signup" ? "signup" : "login";
  const [view, setView] = useState<"login" | "signup">(initial);
  const redirectTo = searchParams.get("redirect") || undefined;

  useEffect(() => {
    setView(initial);
  }, [initial]);

  return (
    <LayoutWrapper>
      <div className="min-h-screen flex">
        {/* Lado esquerdo com animação e ícone */}
        <div className="w-1/2 hidden md:flex flex-col justify-center items-center bg-animated text-[var(--text-header-primary)] p-12 space-y-6">
          <div className="w-28 h-28 animate-bounce">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25M15.75 3v2.25M8.25 3v2.25M12 8.25v13.5m0 0l-3-3m3 3l3-3"
              />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl text-center font-semibold">
            <TypingEffect text="Insira um texto aqui"/>
          </h2>
        </div>

        {/* Lado direito com formulário */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-5 py-3 bg-[var(--background)] text-[var(--text-primary)]">
          <div className="w-full max-w-md">
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

// Animação de digitação
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
