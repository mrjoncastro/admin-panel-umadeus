"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function NovoEnderecoPage() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async () => {
    setErro("");
    setMensagem("");
    if (!user?.id) {
      setErro("Sessão inválida.");
      return;
    }
    try {
      await pb.collection("enderecos").create({
        usuario: user.id,
        rua,
        numero,
        bairro,
        cidade,
        estado,
        cep,
      });
      setMensagem("Endereço cadastrado.");
      setTimeout(() => router.push("/cliente/enderecos"), 1000);
    } catch (err) {
      console.error(err);
      setErro("Erro ao cadastrar endereço.");
    }
  };

  const inputStyle =
    "w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded";

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow">
      <h1 className="text-xl font-bold">Novo Endereço</h1>
      <input
        type="text"
        placeholder="Rua"
        className={inputStyle}
        value={rua}
        onChange={(e) => setRua(e.target.value)}
      />
      <input
        type="text"
        placeholder="Número"
        className={inputStyle}
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />
      <input
        type="text"
        placeholder="Bairro"
        className={inputStyle}
        value={bairro}
        onChange={(e) => setBairro(e.target.value)}
      />
      <input
        type="text"
        placeholder="Cidade"
        className={inputStyle}
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
      />
      <input
        type="text"
        placeholder="Estado"
        className={inputStyle}
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
      />
      <input
        type="text"
        placeholder="CEP"
        className={inputStyle}
        value={cep}
        onChange={(e) => setCep(e.target.value)}
      />
      {mensagem && <p className="text-green-500 text-sm">{mensagem}</p>}
      {erro && <p className="text-red-500 text-sm">{erro}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button className="text-sm text-gray-600 dark:text-gray-300" onClick={() => router.back()}>
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
