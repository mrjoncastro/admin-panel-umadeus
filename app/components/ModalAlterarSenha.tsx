"use client";

import { useState } from "react";
import pb from "@/lib/pocketbase";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

export default function ModalAlterarSenha({ onClose }: { onClose: () => void }) {
  const { user } = useAuthContext();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleChange = async () => {
    if (!user?.id || !user?.email) {
      showError("Sessão inválida.");
      return;
    }

    if (novaSenha !== confirmacao) {
      showError("As senhas não conferem.");
      return;
    }

    try {
      setCarregando(true);
      await pb.collection("usuarios").authWithPassword(user.email, senhaAtual);
      await pb.collection("usuarios").update(user.id, {
        password: novaSenha,
        passwordConfirm: confirmacao,
      });
      showSuccess("Senha alterada com sucesso.");
      onClose();
    } catch (err) {
      console.error(err);
      showError("Erro ao alterar senha. Verifique os dados.");
    } finally {
      setCarregando(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded";

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">Alterar Senha</h2>
        <input
          type="password"
          placeholder="Senha atual"
          className={inputClass}
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nova senha"
          className={inputClass}
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirme a nova senha"
          className={inputClass}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-gray-600 dark:text-gray-300">
            Cancelar
          </button>
          <button
            onClick={handleChange}
            disabled={carregando}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm"
          >
            {carregando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

