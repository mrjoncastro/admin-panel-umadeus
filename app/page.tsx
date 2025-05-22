"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, isLoading, user } = useAuthContext();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionamento pós-login
  useEffect(() => {
    if (!isLoading && isLoggedIn && user) {
      if (user.role === "coordenador") {
        router.replace("/dashboard");
      } else if (user.role === "lider") {
        router.replace("/painel-lider");
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded shadow p-6 space-y-4">
        <h1 className="text-xl font-bold text-center">Login - UMADEUS</h1>

        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className={`w-full py-2 rounded transition cursor-pointer ${
            isSubmitting
              ? "bg-gray-400 text-white"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
