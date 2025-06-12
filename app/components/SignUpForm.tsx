"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import createPocketBase from "@/lib/pocketbase"; // ajuste para seu caminho real

const VIA_CEP_URL =
  process.env.NEXT_PUBLIC_VIA_CEP_URL || "https://viacep.com.br/ws";

export default function SignUpForm({
  onSuccess,
  children,
}: {
  onSuccess?: () => void;
  children?: React.ReactNode;
}) {
  const { signUp } = useAuthContext();
  const pb = createPocketBase();

  const [campos, setCampos] = useState<{ id: string; nome: string }[]>([]);
  const [campo, setCampo] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Busca os campos disponíveis
  useEffect(() => {
    pb.collection("campos")
      .getFullList({ sort: "nome" })
      .then((res) => {
        const lista = res.map((item) => ({ id: item.id, nome: item.nome }));
        setCampos(lista);
      })
      .catch(() => {
        console.warn("Erro ao carregar os campos");
      });
  }, [pb]);

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    fetch(`${VIA_CEP_URL}/${cleanCep}/json/`)
      .then(async (res) => {
        if (!res.ok) {
          setErro("CEP n\u00e3o encontrado.");
          setEndereco("");
          setCidade("");
          setEstado("");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || data.erro) return;
        setEndereco(data.logradouro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
      })
      .catch(() => {
        setErro("Erro ao buscar o CEP.");
      });
  }, [cep]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha !== senhaConfirm) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (!campo) {
      setErro("Selecione um campo.");
      return;
    }

    setLoading(true);
    try {
      await signUp(
        nome,
        email,
        telefone,
        cpf,
        endereco,
        numero,
        estado,
        cep,
        cidade,
        senha
      );
      onSuccess?.();
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setErro("Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto px-4 py-6 bg-white/5 rounded-xl"
    >
      <h2 className="text-xl font-semibold text-center text-white">
        Criar Conta
      </h2>

      {erro && <p className="text-sm text-center text-red-400">{erro}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nome completo"
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
          type="date"
          placeholder="Data de Nascimento"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className="input-base"
          required
        />

        <select
          value={campo}
          onChange={(e) => setCampo(e.target.value)}
          className="input-base"
          required
        >
          <option value="">Selecione o campo</option>
          {campos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          className="input-base"
          required
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="input-base"
          required
        />
        <input
          type="text"
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="input-base"
          required
        />
        <input
          type="text"
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="input-base"
          required
        />
        <input
          type="text"
          placeholder="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="input-base"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`btn btn-primary w-full ${loading ? "opacity-50" : ""}`}
      >
        {loading ? "Enviando..." : "Criar conta"}
      </button>

      {children && (
        <div className="text-sm text-gray-300 text-center">{children}</div>
      )}
    </form>
  );
}
