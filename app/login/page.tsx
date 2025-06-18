"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useAppConfig } from "@/lib/context/AppConfigContext";

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
  const { config } = useAppConfig();
  const initial = searchParams.get("view") === "signup" ? "signup" : "login";
  const [view, setView] = useState<"login" | "signup">(initial);
  const redirectTo = searchParams.get("redirect") || undefined;

  useEffect(() => {
    setView(initial);
  }, [initial]);

  return (
    <LayoutWrapper>
      <div className="min-h-screen flex">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-5 py-3 text-[var(--text-primary)]">
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
