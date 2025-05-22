"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { Pedido } from "@/types";
import pb from "@/lib/pocketbase";
import { saveAs } from "file-saver";
import ModalEditarPedido from "./componentes/ModalEditarPedido";

export default function PedidosPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthContext();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCampo, setFiltroCampo] = useState("");
  const [buscaGlobal, setBuscaGlobal] = useState("");
  const [ordem, setOrdem] = useState<"asc" | "desc">("desc");
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  // Redireciona se não for coordenador
  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== "coordenador") {
      router.replace("/");
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (!user || user.role !== "coordenador") return;

    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const res = await pb.collection("pedidos").getList<Pedido>(pagina, 10, {
          expand: "campo,criado_por",
          sort: `${ordem === "desc" ? "-" : ""}created`,
        });
        setPedidos(res.items);
        setTotalPaginas(res.totalPages);
      } catch (err) {
        console.error("Erro ao carregar pedidos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [pagina, ordem, user]);

  const pedidosFiltrados = pedidos.filter((p) => {
    const matchStatus = filtroStatus === "" || p.status === filtroStatus;
    const matchCampo =
      filtroCampo === "" ||
      p.expand?.campo?.nome?.toLowerCase().includes(filtroCampo.toLowerCase());
    const matchBuscaGlobal =
      buscaGlobal === "" ||
      p.produto.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
      p.email.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
      p.expand?.campo?.nome?.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
      p.expand?.criado_por?.nome?.toLowerCase().includes(buscaGlobal.toLowerCase());

    return matchStatus && matchCampo && matchBuscaGlobal;
  });

  const exportarCSV = () => {
    const header = [
      "Produto",
      "Email",
      "Tamanho",
      "Cor",
      "Status",
      "Campo",
      "Criado por",
      "ID Pagamento",
      "Data",
    ];

    const linhas = pedidosFiltrados.map((p) => [
      p.produto,
      p.email,
      p.tamanho || "",
      p.cor || "",
      p.status,
      p.expand?.campo?.nome || "",
      p.expand?.criado_por?.nome || "",
      p.id_pagamento || "",
      p.created?.split("T")[0] || "",
    ]);

    const csvContent = [header, ...linhas]
      .map((linha) => linha.map((valor) => `"${valor}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const hoje = new Date().toISOString().split("T")[0];
    saveAs(blob, `pedidos_exportados_${hoje}.csv`);
  };

  if (loading) {
    return <p className="p-6 text-center text-sm">Carregando pedidos...</p>;
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pedidos Recebidos</h1>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Buscar em todos os campos"
          value={buscaGlobal}
          onChange={(e) => setBuscaGlobal(e.target.value)}
          className="border p-2 rounded text-sm w-full md:w-64"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border p-2 rounded text-sm"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <input
          type="text"
          placeholder="Filtrar por campo"
          value={filtroCampo}
          onChange={(e) => setFiltroCampo(e.target.value)}
          className="border p-2 rounded text-sm w-60"
        />
        <button
          onClick={() => setOrdem(ordem === "desc" ? "asc" : "desc")}
          className="text-sm border px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
        >
          Ordenar por data ({ordem === "desc" ? "↓" : "↑"})
        </button>
        <button
          onClick={exportarCSV}
          className="text-sm border px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Exportar CSV
        </button>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Produto</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Tamanho</th>
                <th className="p-2 border">Cor</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Campo</th>
                <th className="p-2 border">Criado por</th>
                <th className="p-2 border">ID Pagamento</th>
                <th className="p-2 border">Ação</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="p-2 border font-medium">{pedido.produto}</td>
                  <td className="p-2 border">{pedido.email}</td>
                  <td className="p-2 border">{pedido.tamanho || "—"}</td>
                  <td className="p-2 border">{pedido.cor || "—"}</td>
                  <td className="p-2 border capitalize">{pedido.status}</td>
                  <td className="p-2 border">{pedido.expand?.campo?.nome || "—"}</td>
                  <td className="p-2 border">{pedido.expand?.criado_por?.nome || "—"}</td>
                  <td className="p-2 border text-xs">{pedido.id_pagamento || "—"}</td>
                  <td className="p-2 border space-x-2 text-right">
                    <button
                      onClick={() => setPedidoSelecionado(pedido)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Tem certeza que deseja excluir este pedido?")) {
                          try {
                            await pb.collection("pedidos").delete(pedido.id);
                            setPedidos((prev) => prev.filter((p) => p.id !== pedido.id));
                          } catch (e) {
                            console.error("Erro ao excluir:", e);
                          }
                        }
                      }}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pedidoSelecionado && (
        <ModalEditarPedido
          pedido={pedidoSelecionado}
          onClose={() => setPedidoSelecionado(null)}
          onSave={async (dadosAtualizados) => {
            try {
              const atualizado = await pb
                .collection("pedidos")
                .update(pedidoSelecionado.id, dadosAtualizados);
              setPedidos((prev) =>
                prev.map((p) => (p.id === atualizado.id ? { ...p, ...atualizado } : p))
              );
              setPedidoSelecionado(null);
            } catch (e) {
              console.error("Erro ao salvar edição:", e);
            }
          }}
        />
      )}

      <div className="flex justify-between items-center mt-6 text-sm">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </main>
  );
}
