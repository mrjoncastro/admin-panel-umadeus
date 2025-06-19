"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { logInfo } from "@/lib/logger";
import { useToast } from "@/lib/context/ToastContext";
import { calculateGross, type PaymentMethod } from "@/lib/asaasFees";
import { useAppConfig } from "@/lib/context/AppConfigContext";
import Spinner from "@/components/Spinner";

interface Produto {
  nome: string;
  valor: number;
  tamanhos?: string[];
}

interface ProdutoPB {
  nome: string;
  preco: number;
  tamanhos?: string[] | string;
}

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
  const { config } = useAppConfig();

  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [form, setForm] = useState<FormFields>({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    data_nascimento: "",
    tamanho: "",
    produto: "",
    genero: "",
  });

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [installments, setInstallments] = useState(1);
  const [campoNome, setCampoNome] = useState("");
  const [evento, setEvento] = useState<{
    titulo: string;
    descricao: string;
  } | null>(null);

  const base = useMemo(
    () => produtos.find((p) => p.nome === form.produto)?.valor ?? 0,
    [form.produto, produtos]
  );
  const current = useMemo(
    () => produtos.find((p) => p.nome === form.produto),
    [form.produto, produtos]
  );
  const totalGross = useMemo(
    () => calculateGross(base, paymentMethod, installments).gross,
    [base, paymentMethod, installments]
  );

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

        const prods = Array.isArray(data?.expand?.produtos)
          ? (data.expand.produtos as ProdutoPB[])
          : [];
        const mapped = prods.map((p) => ({
          nome: p.nome,
          valor: p.preco,
          tamanhos: Array.isArray(p.tamanhos)
            ? p.tamanhos
            : p.tamanhos
            ? [p.tamanhos]
            : undefined,
        }));
        setProdutos(mapped);
        if (mapped.length > 0) {
          setForm((prev) => ({
            ...prev,
            produto: mapped[0].nome,
            tamanho: "",
          }));
        } else {
          setForm((prev) => ({ ...prev, produto: "", tamanho: "" }));
        }
      })
      .catch(() => {});
  }, [eventoId]);

  useEffect(() => {
    if (paymentMethod !== "credito" && installments !== 1) {
      setInstallments(1);
    }
  }, [paymentMethod, installments]);

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

    setForm((prev) => {
      const updated = { ...prev, [name]: newValue };
      if (name === "produto") {
        const prod = produtos.find((p) => p.nome === newValue);
        if (!prod?.tamanhos?.length) {
          updated.tamanho = "";
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Envia os dados para a API de inscrição
      const resposta = await fetch("/admin/api/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          liderId,
          eventoId,
          paymentMethod,
          installments,
        }),
      });

      const result = await resposta.json();

      if (!resposta.ok) {
        showError(`❌ ${result.erro || "Erro ao salvar inscrição."}`);
        return;
      }

      // 2. Envia notificação para o n8n de forma assíncrona
      fetch("/admin/api/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          liderId,
          eventoId,
          inscricaoId: result.inscricaoId,
          paymentMethod,
          installments,
        }),
      }).catch((erro) =>
        logInfo("⚠️ Falha ao notificar o n8n", erro)
      );

      // 3. Redireciona se já houver link de pagamento
      if (result.link_pagamento) {
        showSuccess(
          "✅ Inscrição enviada com sucesso! Redirecionando para pagamento..."
        );
        window.location.href = result.link_pagamento;
        return;
      }

      // 4. Exibe mensagem de sucesso padrão
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
        <p className="text-center text-sm text-gray-600 mb-2">
          {evento.descricao}
        </p>
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
            {produtos.length > 0 ? (
              produtos.map((p) => (
                <option key={p.nome} value={p.nome}>
                  {p.nome}
                </option>
              ))
            ) : (
              <option value="">Nenhum produto disponível</option>
            )}
          </select>
        </div>

        {current?.tamanhos && (
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
              {current.tamanhos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">
            Forma de pagamento
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="pix">Pix</option>
            <option value="boleto">Boleto</option>
            <option value="credito">Crédito</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">
            Parcelas
          </label>
          <select
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            disabled={paymentMethod !== "credito"}
            className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}x
              </option>
            ))}
          </select>
          <p className="text-sm mt-1">
            Total: R$ {totalGross.toFixed(2).replace(".", ",")}
          </p>
          {installments > 1 && (
            <p className="text-xs text-gray-500">
              Valor da parcela: R${" "}
              {(totalGross / installments).toFixed(2).replace(".", ",")}
            </p>
          )}
        </div>

        {config.confirmaInscricoes && (
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
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="w-4 h-4" />
              Enviando...
            </span>
          ) : (
            "Finalizar inscrição"
          )}
        </button>
      </form>
    </div>
  );
}
