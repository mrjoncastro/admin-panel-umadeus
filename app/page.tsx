"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import Image from "next/image";
import RedefinirSenhaModal from "./admin/components/RedefinirSenhaModal";

export default function LoginPage() {
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
      if (user.role === "coordenador") {
        router.replace("/dashboard");
      } else if (user.role === "lider") {
        router.replace("/lider-painel");
      } else {
        setErro("Perfil de acesso não permitido.");
      }
    }
  }, [isLoading, isLoggedIn, user, router]);

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
    <div className="relative h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <div
        className="absolute inset-0 bg-animated opacity-60"
        aria-hidden="true"
      ></div>
      <div className="relative z-10 w-full max-w-sm p-6 bg-black/60 rounded-xl backdrop-blur-md text-gray-200">
        <div className="flex justify-center mb-4">
          <Image
            src="/img/logo_umadeus_branco.png"
            alt="Logo UMADEUS"
            width={120}
            height={120}
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 fade-in-up">
          Bem-vindo!
        </h1>
        <p
          className="text-center text-sm text-gray-300 mb-6 fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Acesse o painel
        </p>

        {erro && (
          <p className="text-sm text-center mb-4" style={{ color: "#e81920" }}>
            {erro}
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "#DCDCDD",
              color: "#000000",
              borderColor: "#ababab",
              outlineColor: "#e81920",
            }}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "#DCDCDD",
              color: "#000000",
              borderColor: "#ababab",
              outlineColor: "#e81920",
            }}
            required
          />
          <div className="text-right text-sm">
            <button
              type="button"
              onClick={() => setMostrarModal(true)}
              className="underline text-[#DCDCDD] hover:text-white transition"
            >
              Esqueci minha senha
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded font-semibold transition ${
              isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            style={{
              backgroundColor: isSubmitting ? "#ababab" : "#e81920",
              color: "#ffffff",
            }}
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
