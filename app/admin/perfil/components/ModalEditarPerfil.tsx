"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuthContext } from "@/lib/context/AuthContext";
import createPocketBase from "@/lib/pocketbase";

export default function ModalEditarPerfil({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user } = useAuthContext();
  const pb = useMemo(() => createPocketBase(), []);
  const [nome, setNome] = useState(String(user?.nome || ""));
  const [telefone, setTelefone] = useState(String(user?.telefone || ""));
  const [cpf, setCpf] = useState(String(user?.cpf || ""));
  const [dataNascimento, setDataNascimento] = useState(
    String(user?.data_nascimento || "")
  );
  const [endereco, setEndereco] = useState(String(user?.endereco || ""));
  const [numero, setNumero] = useState(String(user?.numero || ""));
  const [estado, setEstado] = useState(String(user?.estado || ""));
  const [cep, setCep] = useState(String(user?.cep || ""));
  const [cidade, setCidade] = useState(String(user?.cidade || ""));

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleUpdate = async () => {
    setMensagem("");
    setErro("");

    if (!user?.id) {
      setErro("Sessão inválida.");
      return;
    }

    try {
      await pb.collection("usuarios").update(user.id, {
        nome: String(nome).trim(),
        telefone: String(telefone).trim(),
        cpf: String(cpf).trim(),
        data_nascimento: String(dataNascimento),
        endereco: String(endereco).trim(),
        numero: String(numero).trim(),
        estado: String(estado).trim(),
        cep: String(cep).trim(),
        cidade: String(cidade).trim(),
        role: user.role,
      });

      setMensagem("Perfil atualizado com sucesso.");
    } catch (err) {
      console.error(err);
      setErro("Erro ao atualizar perfil. Verifique os dados.");
    }
  };

  const inputStyle =
    "w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded";

  return (
    <Dialog.Root open onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        <Dialog.Portal forceMount>
          <Dialog.Overlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            >
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-5"
                >
                  <Dialog.Description className="sr-only">Formulário de perfil</Dialog.Description>
                  <Dialog.Title asChild>
                    <h3 className="text-xl font-semibold text-center">Editar Perfil</h3>
                  </Dialog.Title>

        <input
          type="text"
          placeholder="Nome completo"
          className={inputStyle}
          value={String(nome)}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="text"
          placeholder="Telefone"
          className={inputStyle}
          value={String(telefone)}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <input
          type="text"
          placeholder="CPF"
          className={inputStyle}
          value={String(cpf)}
          onChange={(e) => setCpf(e.target.value)}
        />

        <input
          type="date"
          className={inputStyle}
          value={String(dataNascimento)}
          onChange={(e) => setDataNascimento(e.target.value)}
        />

        <input
          type="text"
          placeholder="Endereço"
          className={inputStyle}
          value={String(endereco)}
          onChange={(e) => setEndereco(e.target.value)}
        />

        <input
          type="text"
          placeholder="Número"
          className={inputStyle}
          value={String(numero)}
          onChange={(e) => setNumero(e.target.value)}
        />

        <input
          type="text"
          placeholder="Estado"
          className={inputStyle}
          value={String(estado)}
          onChange={(e) => setEstado(e.target.value)}
        />

        <input
          type="text"
          placeholder="CEP"
          className={inputStyle}
          value={String(cep)}
          onChange={(e) => setCep(e.target.value)}
        />

        <input
          type="text"
          placeholder="Cidade"
          className={inputStyle}
          value={String(cidade)}
          onChange={(e) => setCidade(e.target.value)}
        />

        <div>
          <input
            type="email"
            disabled
            value={String(user?.email || "")}
            className={`${inputStyle} opacity-60 cursor-not-allowed`}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            O e-mail não pode ser alterado. Para mudanças, entre em contato com
            o suporte.
          </p>
        </div>

        {mensagem && <p className="text-green-500 text-sm">{mensagem}</p>}
        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="text-sm text-gray-600 dark:text-gray-300"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="bg-black dark:bg-white text-white dark:text-black text-sm px-4 py-2 rounded-lg"
            onClick={handleUpdate}
          >
            Salvar
          </button>
        </div>
                </motion.div>
              </Dialog.Content>
            </motion.div>
            </Dialog.Overlay>
        </Dialog.Portal>
      </AnimatePresence>
    </Dialog.Root>
  );
}
