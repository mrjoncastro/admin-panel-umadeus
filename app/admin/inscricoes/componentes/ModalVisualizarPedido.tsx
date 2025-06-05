"use client";
import { useEffect, useState, useMemo } from "react";
import { X, Copy } from "lucide-react";
import createPocketBase from "@/lib/pocketbase";

interface Props {
  pedidoId: string;
  onClose: () => void;
}

type PedidoExpandido = {
  id: string;
  valor: number;
  status: string;
  produto: string;
  cor?: string;
  tamanho?: string;
  genero?: string;
  email?: string;
  expand?: {
    campo?: { nome?: string };
    responsavel?: { nome?: string; id?: string };
    id_inscricao?: {
      nome: string;
      telefone: string;
      cpf: string;
      evento: string;
    };
  };
};

export default function ModalVisualizarPedido({ pedidoId, onClose }: Props) {
  const pb = useMemo(() => createPocketBase(), []);
  const [pedido, setPedido] = useState<PedidoExpandido | null>(null);
  const [loading, setLoading] = useState(true);
  const [reenviando, setReenviando] = useState(false);
  const [copiando, setCopiando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [urlPagamento, setUrlPagamento] = useState("");

  useEffect(() => {
    pb.collection("pedidos")
      .getOne(pedidoId, { expand: "id_inscricao,campo,responsavel" })
      .then((res) => setPedido(res as unknown as PedidoExpandido))
      .catch(() => setMensagem("Erro ao carregar dados do pedido"))
      .finally(() => setLoading(false));
  }, [pb, pedidoId]);

  const reenviarPagamento = async () => {
    if (!pedido?.id || !pedido?.valor || !pedido?.expand?.id_inscricao) return;

    setReenviando(true);
    try {
      const checkoutRes = await fetch("/admin/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: pedido.id, valor: pedido.valor }),
      });

      const { url } = await checkoutRes.json();
      setUrlPagamento(url);

      await fetch("/admin/api/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: pedido.expand.id_inscricao.nome,
          telefone: pedido.expand.id_inscricao.telefone,
          cpf: pedido.expand.id_inscricao.cpf,
          evento: pedido.expand.id_inscricao.evento,
          liderId: pedido.expand?.responsavel?.id,
          pedidoId: pedido.id,
          valor: pedido.valor,
          url_pagamento: url,
        }),
      });

      setMensagem("✅ Link reenviado com sucesso!");
    } catch {
      setMensagem("❌ Erro ao reenviar link.");
    } finally {
      setReenviando(false);
    }
  };

  const copiarLink = async () => {
    if (!urlPagamento) return;
    await navigator.clipboard.writeText(urlPagamento);
    setCopiando(true);
    setTimeout(() => setCopiando(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center px-2">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-purple-700 text-center">
          📦 Detalhes do Pedido
        </h2>

        {loading || !pedido ? (
          <p className="text-sm text-gray-500 text-center">Carregando...</p>
        ) : (
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>ID:</strong> {pedido.id}</p>
            <p><strong>Valor:</strong> R$ {pedido.valor?.toFixed(2)}</p>
            <p><strong>Status:</strong> {pedido.status}</p>
            <p><strong>Produto:</strong> {pedido.produto}</p>
            <p><strong>Tamanho:</strong> {pedido.tamanho || "—"}</p>
            <p><strong>Cor:</strong> {pedido.cor || "—"}</p>
            <p><strong>Gênero:</strong> {pedido.genero || "—"}</p>
            <p><strong>E-mail:</strong> {pedido.email || "—"}</p>
            <p><strong>Campo:</strong> {pedido.expand?.campo?.nome || "—"}</p>
            <p><strong>Responsável:</strong> {pedido.expand?.responsavel?.nome || "—"}</p>

            <button
              onClick={reenviarPagamento}
              disabled={reenviando}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
            >
              {reenviando ? "Reenviando..." : "📤 Reenviar link de pagamento"}
            </button>

            {urlPagamento && (
              <div className="mt-3 flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                <span className="text-xs text-gray-600 truncate">
                  {urlPagamento}
                </span>
                <button
                  onClick={copiarLink}
                  className="text-purple-600 hover:text-purple-800 ml-2"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}

            {copiando && (
              <p className="text-xs text-green-600 text-center animate-pulse">
                ✅ Link copiado!
              </p>
            )}

            {mensagem && <p className="mt-3 text-center text-sm">{mensagem}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
