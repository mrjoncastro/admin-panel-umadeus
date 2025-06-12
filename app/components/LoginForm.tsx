"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import Image from "next/image";
import RedefinirSenhaModal from "@/app/admin/components/RedefinirSenhaModal";
import "@/app/globals.css"; // Certifique-se de que o CSS global está importado

export default function LoginForm({
  redirectTo,
  children,
}: {
  redirectTo?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const { login, isLoggedIn, isLoading, user } = useAuthContext();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Redirecionamento pós-login
  useEffect(() => {
    if (!isLoading && isLoggedIn && user) {
      if (redirectTo) {
        router.replace(redirectTo);
      } else if (user.role === "coordenador") {
        router.replace("/admin/dashboard");
      } else if (user.role === "lider") {
        router.replace("/admin/lider-painel");
      } else {
        router.replace("/loja/cliente");
      }
    }
  }, [isLoading, isLoggedIn, user, router, redirectTo]);

  if (!isLoading && isLoggedIn) {
    return null; // impede que o componente renderize novamente
  }

  const handleLogin = async () => {
    setErro("");
    setIsSubmitting(true);

    try {
      await login(email, senha);
      // Redirecionamento ocorre no useEffect
    } catch (e) {
      console.error("❌ Erro no login:", e);
      setErro("Credenciais inválidas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <p className="text-gray-700 text-sm">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 w-full max-w-sm p-[var(--space-lg)] bg-primary-900 rounded-xl backdrop-blur-md text-gray-200">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Image
            src="/img/logo_umadeus_branco.png"
            alt="Logo UMADEUS"
            width={120}
            height={120}
            priority
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold text-center mb-2"
        >
          Bem-vindo!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-sm text-gray-300 mb-6"
        >
          Acesse o painel
        </motion.p>

        {erro && <p className="text-sm text-center mb-4 text-error">{erro}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-[var(--space-md)]"
        >
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input-base"
            required
          />
          <div className="text-right text-sm">
            <button
              type="button"
              onClick={() => setMostrarModal(true)}
              className="underline text-[var(--color-secondary)] hover:text-white transition"
            >
              Esqueci minha senha
            </button>
          </div>
          {children && (
            <div className="text-sm text-gray-300 text-center">{children}</div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn block mx-auto ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--accent)]"
            }`}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {mostrarModal && (
          <RedefinirSenhaModal onClose={() => setMostrarModal(false)} />
        )}
      </div>
    </div>
  );
}
