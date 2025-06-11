"use client";

import { useState } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signUp } = useAuthContext();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha !== senhaConfirm) {
      setErro("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await signUp(nome, email, telefone, cpf, senha);
      onSuccess?.();
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setErro("Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && <p className="text-sm text-center text-error">{erro}</p>}
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="input-base"
        required
      />
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-base"
        required
      />
      <input
        type="text"
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        className="input-base"
        required
      />
      <input
        type="text"
        placeholder="CPF"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
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
      <input
        type="password"
        placeholder="Confirme a senha"
        value={senhaConfirm}
        onChange={(e) => setSenhaConfirm(e.target.value)}
        className="input-base"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className={`btn btn-primary w-full ${loading ? "opacity-50" : ""}`}
      >
        {loading ? "Enviando..." : "Criar conta"}
      </button>
    </form>
  );
}
