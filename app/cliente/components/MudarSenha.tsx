"use client";

import { useState } from "react";
import pb from "@/lib/pocketbase";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function MudarSenha({ onClose }: { onClose: () => void }) {
  const { user } = useAuthContext();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async () => {
    setErro("");
    setMensagem("");
    if (!user?.id) {
      setErro("Sessão inválida.");
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }
    try {
      await pb.collection("usuarios").update(user.id, {
        password: novaSenha,
        passwordConfirm: confirmacao,
        oldPassword: senhaAtual,
      });
      setMensagem("Senha atualizada com sucesso.");
    } catch (err) {
      console.error(err);
      setErro("Erro ao atualizar senha.");
    }
  };

  const inputStyle =
    "w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded";

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-5">
        <h2 className="text-xl font-semibold text-center">Alterar Senha</h2>
        <input
          type="password"
          placeholder="Senha atual"
          className={inputStyle}
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nova senha"
          className={inputStyle}
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          className={inputStyle}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
        />
        {mensagem && <p className="text-green-500 text-sm">{mensagem}</p>}
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button className="text-sm text-gray-600 dark:text-gray-300" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="bg-black dark:bg-white text-white dark:text-black text-sm px-4 py-2 rounded-lg"
            onClick={handleSubmit}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
