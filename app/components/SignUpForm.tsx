"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import createPocketBase from "@/lib/pocketbase";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function SignUpForm() {
  const router = useRouter();
  const pb = useMemo(() => createPocketBase(), []);
  const { login, isLoggedIn, isLoading, user } = useAuthContext();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState({ nome: "", email: "", telefone: "", senha: "", geral: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isLoggedIn && user) {
      if (user.role === "coordenador") {
        router.replace("/admin/dashboard");
      } else if (user.role === "lider") {
        router.replace("/admin/lider-painel");
      } else {
        router.replace("/loja/cliente");
      }
    }
  }, [isLoading, isLoggedIn, user, router]);

  if (!isLoading && isLoggedIn) {
    return null;
  }

  const maskTelefone = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");

  const validar = () => {
    const novo = { nome: "", email: "", telefone: "", senha: "", geral: "" };
    let ok = true;
    if (nome.trim().length < 2) {
      novo.nome = "Nome obrigatório";
      ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novo.email = "E-mail inválido";
      ok = false;
    }
    if (telefone.replace(/\D/g, "").length < 10) {
      novo.telefone = "Telefone inválido";
      ok = false;
    }
    if (senha.length < 6) {
      novo.senha = "Mínimo de 6 caracteres";
      ok = false;
    }
    setErros(novo);
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setIsSubmitting(true);
    try {
      await pb.collection("usuarios").create({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.replace(/\D/g, ""),
        password: senha,
        passwordConfirm: senha,
        role: "usuario",
      });

      await login(email.trim(), senha);
    } catch (err) {
      console.error(err);
      setErros((prev) => ({ ...prev, geral: "Erro ao criar conta" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold text-center">Criar Conta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Nome"
            className="input-base"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          {erros.nome && <p className="text-sm text-error mt-1">{erros.nome}</p>}
        </div>
        <div>
          <input
            type="email"
            placeholder="E-mail"
            className="input-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {erros.email && <p className="text-sm text-error mt-1">{erros.email}</p>}
        </div>
        <div>
          <input
            type="tel"
            placeholder="Telefone"
            className="input-base"
            value={telefone}
            onChange={(e) => setTelefone(maskTelefone(e.target.value))}
            required
          />
          {erros.telefone && <p className="text-sm text-error mt-1">{erros.telefone}</p>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Senha"
            className="input-base"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          {erros.senha && <p className="text-sm text-error mt-1">{erros.senha}</p>}
        </div>
        {erros.geral && <p className="text-sm text-error text-center">{erros.geral}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn block w-full ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[var(--accent)]"}`}
        >
          {isSubmitting ? "Enviando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}

