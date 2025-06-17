"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { logInfo } from "@/lib/logger";
import { useToast } from "@/lib/context/ToastContext";

const PRODUTOS = [
  { nome: "Kit Camisa + Pulseira", valor: 50.0 },
  { nome: "Somente Pulseira", valor: 10.0 },
];

interface FormFields {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  tamanho: string;
  produto: string;
  genero: string;
}

export default function InscricaoPage() {
  const params = useParams();
  const liderId = params.liderId as string;
  const eventoId = params.eventoId as string;

  const { showError, showSuccess } = useToast();

  const [form, setForm] = useState<FormFields>({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    data_nascimento: "",
    tamanho: "",
    produto: PRODUTOS[0].nome,
    genero: "",
  });

  const [loading, setLoading] = useState(false);
  const [campoNome, setCampoNome] = useState("");
  const [evento, setEvento] = useState<{ titulo: string; descricao: string } | null>(null);

  useEffect(() => {
    if (!liderId) return;

    fetch(`/admin/api/lider/${liderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.campo) {
          setCampoNome(data.campo);
        } else {
          showError("❌ Link inválido ou expirado.");
        }
      })
      .catch(() => showError("❌ Erro ao buscar dados do líder."));
  }, [liderId, showError]);

  useEffect(() => {
    if (!eventoId) return;
    fetch(`/api/eventos/${eventoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.titulo) {
          setEvento({ titulo: data.titulo, descricao: data.descricao });
        }
      })
      .catch(() => {});
  }, [eventoId]);

  const maskCPF = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  const maskTelefone = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "cpf") newValue = maskCPF(value);
    if (name === "telefone") newValue = maskTelefone(value);

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "produto" && value === "Somente Pulseira"
        ? { tamanho: "" }
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Envia os dados para a API de inscrição
      const resposta = await fetch("/admin/api/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, liderId, eventoId }),
      });

      const result = await resposta.json();

      if (!resposta.ok) {
        showError(`❌ ${result.erro || "Erro ao salvar inscrição."}`);
        return;
      }

      // 2. Envia notificação para o n8n
      try {
        await fetch("/admin/api/n8n", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            liderId,
            eventoId,
            inscricaoId: result.inscricaoId,
          }),
        });
      } catch (erro) {
        logInfo(
          "⚠️ Falha ao notificar o n8n (sem impacto no usuário)",
          erro
        );
      }

      // 3. Exibe mensagem de sucesso
      showSuccess(
        "✅ Inscrição enviada com sucesso! Em breve você receberá o link de pagamento."
      );
    } catch (erro) {
      console.error("❌ Erro no handleSubmit:", erro);
      showError("❌ Erro ao processar inscrição.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-2xl shadow-2xl font-sans">
      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 text-center">
        Já fez a inscrição?{" "}
        <Link
          href="/admin/inscricoes/recuperar"
          className="text-purple-700 font-medium underline hover:text-purple-900"
        >
          Clique aqui para concluir
        </Link>
      </div>

      <h1 className="text-2xl font-extrabold text-purple-700 mb-3 text-center">
        {evento ? `Inscrição para ${evento.titulo}` : "Inscrição"}
      </h1>
      {evento?.descricao && (
        <p className="text-center text-sm text-gray-600 mb-2">{evento.descricao}</p>
      )}
      {campoNome && (
        <p className="mb-4 text-center text-sm text-gray-500">
          Campo responsável: <span className="font-medium">{campoNome}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            value={form.nome}
            onChange={handleChange}
            required
            className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <input
            type="text"
            name="telefone"
            placeholder="Telefone"
            value={form.telefone}
            onChange={handleChange}
            required
            className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={form.cpf}
            onChange={handleChange}
            required
            className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Gênero
            </label>
            <select
              name="genero"
              value={form.genero}
              onChange={handleChange}
              required
              className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Selecione seu gênero</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="data_nascimento"
              value={form.data_nascimento}
              onChange={handleChange}
              required
              className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Produto
            </label>
            <select
              name="produto"
              value={form.produto}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {PRODUTOS.map((p) => (
                <option key={p.nome} value={p.nome}>
                  {p.nome} - R$ {p.valor.toFixed(2).replace(".", ",")}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Valor: R${" "}
              {PRODUTOS.find((p) => p.nome === form.produto)
                ?.valor.toFixed(2)
                .replace(".", ",")}
            </p>
          </div>

          {form.produto !== "Somente Pulseira" && (
            <div>
              <label className="block font-medium text-sm text-gray-700 mb-1">
                Tamanho da camisa
              </label>
              <select
                name="tamanho"
                value={form.tamanho}
                onChange={handleChange}
                className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Selecione o tamanho da camisa</option>
                {["PP", "P", "M", "G", "GG"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-start mt-4">
            <input
              type="checkbox"
              required
              id="confirmacao"
              className="mt-1 mr-2 accent-purple-600"
            />
            <label htmlFor="confirmacao" className="text-sm text-gray-600">
              Estou ciente de que minha inscrição só será confirmada após a
              liberação do pagamento pela liderança.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Enviando..." : "Finalizar inscrição"}
          </button>
        </form>
    </div>
  );
}
