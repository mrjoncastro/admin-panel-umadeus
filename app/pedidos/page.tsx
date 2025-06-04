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
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(
    null
  );
  const placeholderBusca =
    user?.role === "coordenador"
      ? "Buscar por produto, email, nome ou campo"
      : "Buscar por nome ou email";

  // Redireciona se não for coordenador
  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace("/");
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const filtro =
          user.role === "coordenador" ? "" : `campo = "${user.campo}"`;

        const res = await pb.collection("pedidos").getList<Pedido>(pagina, 10, {
          filter: filtro,
          expand: "campo,id_inscricao",
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
      p.expand?.id_inscricao?.nome?.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
      p.expand?.id_inscricao?.cpf?.toLowerCase().includes(buscaGlobal.toLowerCase());

    return matchStatus && matchCampo && matchBuscaGlobal;
  });

  const exportarCSV = () => {
    const header = [
      "Produto",
      "Nome",
      "Email",
      "Tamanho",
      "Cor",
      "Status",
      "Campo",
      "ID Pagamento",
      "Data",
    ];

    const linhas = pedidosFiltrados.map((p) => [
      p.produto,
      p.expand?.id_inscricao?.nome || "",
      p.email,
      p.tamanho || "",
      p.cor || "",
      p.status,
      p.expand?.campo?.nome || "",
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
  const statusBadge = {
    pendente: "bg-yellow-100 text-yellow-800",
    pago: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };

  if (loading) {
    return <p className="p-6 text-center text-sm">Carregando pedidos...</p>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-black_bean mb-6">
        Pedidos Recebidos
      </h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder={placeholderBusca}
          value={buscaGlobal}
          onChange={(e) => setBuscaGlobal(e.target.value)}
          className="flex-1 md:flex-none border rounded px-4 py-2 text-sm w-full md:w-64 shadow-sm"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border rounded px-4 py-2 text-sm bg-white shadow-sm"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
        {user?.role === "coordenador" && (
          <input
            type="text"
            placeholder="Filtrar por campo"
            value={filtroCampo}
            onChange={(e) => setFiltroCampo(e.target.value)}
            className="border rounded px-4 py-2 text-sm w-full md:w-60 shadow-sm"
          />
        )}
        <button
          onClick={() => setOrdem(ordem === "desc" ? "asc" : "desc")}
          className="text-sm border px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition"
        >
          Ordenar por data ({ordem === "desc" ? "↓" : "↑"})
        </button>
        <button
          onClick={exportarCSV}
          className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Exportar CSV
        </button>
      </div>

      {/* Tabela */}
      {pedidosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm bg-white">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wide">
              <tr>
                <th className="p-3 text-left">Produto</th>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Tamanho</th>
                <th className="p-3 text-left">Cor</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Campo</th>
                <th className="p-3 text-left">ID Pagamento</th>
                <th className="p-3 text-left">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{pedido.produto}</td>
                  <td className="p-3">{pedido.expand?.id_inscricao?.nome || "—"}</td>
                  <td className="p-3">{pedido.email}</td>
                  <td className="p-3">{pedido.tamanho || "—"}</td>
                  <td className="p-3">{pedido.cor || "—"}</td>
                  <td className="p-3 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusBadge[pedido.status]
                      }`}
                    >
                      {pedido.status}
                    </span>
                  </td>
                  <td className="p-3">{pedido.expand?.campo?.nome || "—"}</td>
                  <td className="p-3 text-xs">{pedido.id_pagamento || "—"}</td>
                  <td className="p-3 space-x-3 text-right">
                    <button
                      onClick={() => setPedidoSelecionado(pedido)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          confirm("Tem certeza que deseja excluir este pedido?")
                        ) {
                          try {
                            await pb.collection("pedidos").delete(pedido.id);
                            setPedidos((prev) =>
                              prev.filter((p) => p.id !== pedido.id)
                            );
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

      {/* Modal de edição */}
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
                prev.map((p) =>
                  p.id === atualizado.id ? { ...p, ...atualizado } : p
                )
              );
              setPedidoSelecionado(null);
            } catch (e) {
              console.error("Erro ao salvar edição:", e);
            }
          }}
        />
      )}

      {/* Paginação */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
        >
          Anterior
        </button>
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
        >
          Próxima
        </button>
      </div>
    </main>
  );
}
