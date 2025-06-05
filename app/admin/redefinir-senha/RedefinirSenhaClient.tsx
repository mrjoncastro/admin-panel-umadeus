"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import createPocketBase from "@/lib/pocketbase";

export default function RedefinirSenhaClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pb = useMemo(() => createPocketBase(), []);
  const token = searchParams.get("token") ?? "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!token) setErro("Token de redefinição inválido ou ausente.");
  }, [token]);

  const handleSubmit = async () => {
    setErro("");
    setMensagem("");
    if (novaSenha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }
    try {
      await pb
        .collection("usuarios")
        .confirmPasswordReset(token, novaSenha, confirmacao);
        setMensagem("Senha redefinida com sucesso!");
        setTimeout(() => router.push("/admin/login"), 2000);
    } catch {
      setErro("Não foi possível redefinir. O link pode ter expirado.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#2A1A1C] px-4 text-[#DCDCDC]">
      <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-6 border border-[#DCDCDC]">
        <h1 className="text-2xl font-bold text-center">Redefinir sua senha</h1>

        <input
          type="password"
          placeholder="Nova senha"
          className="w-full border p-2 rounded"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          className="w-full border p-2 rounded"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
        />

        {erro && <p className="text-sm text-red-500">{erro}</p>}
        {mensagem && <p className="text-sm text-green-500">{mensagem}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg"
        >
          Redefinir senha
        </button>
      </div>
    </main>
  );
}
