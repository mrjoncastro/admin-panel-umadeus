"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { Pedido } from "@/types";
import createPocketBase from "@/lib/pocketbase";
import { saveAs } from "file-saver";
import ModalEditarPedido from "./componentes/ModalEditarPedido";
import { useToast } from "@/lib/context/ToastContext";

export default function PedidosPage() {
  const router = useRouter();
  const { user, isLoggedIn, tenantId } = useAuthContext();
  const pb = useMemo(() => createPocketBase(), []);

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
  const { showError, showSuccess } = useToast();
  const placeholderBusca =
    user?.role === "coordenador"
      ? "Buscar por produto, email, nome ou campo"
      : "Buscar por nome ou email";

  // Redireciona se não for coordenador
  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace("/login");
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const baseFiltro = `cliente='${tenantId}'`;
        const filtro =
          user.role === "coordenador"
            ? baseFiltro
            : `campo = "${user.campo}" && ${baseFiltro}`;

        const res = await pb.collection("pedidos").getList<Pedido>(pagina, 10, {
          filter: filtro,
          expand: "campo,id_inscricao",
          sort: `${ordem === "desc" ? "-" : ""}created`,
        });

        setPedidos(res.items);
        setTotalPaginas(res.totalPages);
      } catch (err) {
        console.error("Erro ao carregar pedidos", err);
        showError("Erro ao carregar pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [pb, pagina, ordem, tenantId, user, showError]);

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
      <h2 className="heading">Pedidos Recebidos</h2>

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
          className="btn btn-secondary"
        >
          Ordenar por data ({ordem === "desc" ? "↓" : "↑"})
        </button>
        <button
          onClick={exportarCSV}
          className="btn btn-primary"
        >
          Exportar CSV
        </button>
      </div>

      {/* Tabela */}
      {pedidosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="table-base">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Tamanho</th>
                <th>Cor</th>
                <th>Status</th>
                <th>Campo</th>
                <th>ID Pagamento</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="font-medium">{pedido.produto}</td>
                  <td>{pedido.expand?.id_inscricao?.nome || "—"}</td>
                  <td>{pedido.email}</td>
                  <td>{pedido.tamanho || "—"}</td>
                  <td>{pedido.cor || "—"}</td>
                  <td className="capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusBadge[pedido.status]
                      }`}
                    >
                      {pedido.status}
                    </span>
                  </td>
                  <td>{pedido.expand?.campo?.nome || "—"}</td>
                  <td className="text-xs">{pedido.id_pagamento || "—"}</td>
                  <td className="space-x-3 text-right">
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
                            showSuccess("Pedido excluído");
                          } catch (e) {
                            console.error("Erro ao excluir:", e);
                            showError("Erro ao excluir pedido");
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
              showSuccess("Pedido atualizado");
            } catch (e) {
              console.error("Erro ao salvar edição:", e);
              showError("Erro ao salvar edição");
            }
          }}
        />
      )}

      {/* Paginação */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          className="btn btn-secondary disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          className="btn btn-secondary disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </main>
  );
}
