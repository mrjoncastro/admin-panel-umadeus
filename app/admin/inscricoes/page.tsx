"use client";

import { useEffect, useState, useMemo } from "react";
import createPocketBase from "@/lib/pocketbase";
import { logInfo } from "@/lib/logger";
import { Copy } from "lucide-react";
import { saveAs } from "file-saver";
import ModalEditarInscricao from "./componentes/ModalEdit";
import ModalVisualizarPedido from "./componentes/ModalVisualizarPedido";
import { CheckCircle, XCircle, Pencil, Trash2, Eye } from "lucide-react";
import TooltipIcon from "../components/TooltipIcon";
import { useToast } from "@/lib/context/ToastContext";
import { PRECO_PULSEIRA, PRECO_KIT } from "@/lib/constants";

const statusBadge = {
  pendente: "bg-yellow-100 text-yellow-800",
  aguardando_pagamento: "bg-blue-100 text-blue-800",
  confirmado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
} as const;

type StatusInscricao = keyof typeof statusBadge;

type Inscricao = {
  id: string;
  nome: string;
  telefone: string;
  cpf: string;
  evento: string;
  status: StatusInscricao;
  created: string;
  campo?: string;
  tamanho?: string;
  genero?: string;
  confirmado_por_lider?: boolean;
  data_nascimento?: string;
  criado_por?: string;
  pedido_id?: string | null;
};

interface UsuarioAuthModel {
  id: string;
  role: "coordenador" | "lider" | string;
  campo?: string;
}

export default function ListaInscricoesPage() {
  const pb = useMemo(() => createPocketBase(), []);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [role, setRole] = useState("");
  const [linkPublico, setLinkPublico] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [inscricaoEmEdicao, setInscricaoEmEdicao] = useState<Inscricao | null>(
    null
  );
  const { showError, showSuccess } = useToast();
  const placeholderBusca =
    role === "coordenador"
      ? "Buscar por nome, telefone, CPF ou campo"
      : "Buscar por nome, telefone ou CPF";

  useEffect(() => {
    const user = pb.authStore.model as unknown as UsuarioAuthModel;

    if (!user?.id || !user?.role) {
      showError("Sessão expirada ou inválida.");
      setLoading(false);
      return;
    }

    pb.autoCancellation(false);

    setRole(user.role);
    setLinkPublico(`${window.location.origin}/inscricoes/${user.id}`);

    const filtro = user.role === "coordenador" ? "" : `campo='${user.campo}'`;

    pb
      .collection("inscricoes")
      .getFullList({ sort: "-created", filter: filtro, expand: "campo,pedido" })
      .then((res) => {
        const lista = res.map((r) => ({
          id: r.id,
          nome: r.nome,
          telefone: r.telefone,
          evento: r.evento,
          cpf: r.cpf,
          status: r.status,
          created: r.created,
          campo: r.expand?.campo?.nome || "—",
          tamanho: r.tamanho,
          produto: r.produto,
          genero: r.genero,
          data_nascimento: r.data_nascimento,
          criado_por: r.criado_por,
          confirmado_por_lider: r.confirmado_por_lider,
          pedido_status: r.expand?.pedido?.status || null,
          pedido_id: r.expand?.pedido?.id || null,
        }));
        setInscricoes(lista);
      })
      .catch(() => showError("Erro ao carregar inscrições."))
      .finally(() => setLoading(false));

    if (user.role === "coordenador") {
      pb
        .collection("campos")
        .getFullList({ sort: "nome" })
        .then(() => {
          // noop
        })
        .catch(() => {});
    }
  }, [pb, showError]);

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkPublico);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      showError("Não foi possível copiar o link.");
    }
  };

  const deletarInscricao = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta inscrição?")) {
      try {
        await pb.collection("inscricoes").delete(id);
        setInscricoes((prev) => prev.filter((i) => i.id !== id));
        showSuccess("Inscrição excluída.");
      } catch {
        showError("Erro ao excluir inscrição.");
      }
    }
  };
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  const confirmarInscricao = async (id: string) => {
    try {
      setConfirmandoId(id);

      // 🔹 1. Buscar inscrição com expand do campo
      const inscricao = await pb.collection("inscricoes").getOne(id, {
        expand: "campo",
      });

      const campo = inscricao.expand?.campo;

      // 🔹 2. Definir valor do pedido com base no produto
      const valorPedido =
        inscricao.produto === "Somente Pulseira" ? PRECO_PULSEIRA : PRECO_KIT;

      const pedido = await pb.collection("pedidos").create({
        id_inscricao: id,
        valor: valorPedido,
        status: "pendente",
        produto: inscricao.produto || "Kit Camisa + Pulseira",
        cor: "Roxo",
        tamanho: inscricao.tamanho,
        genero: inscricao.genero,
        email: inscricao.email,
        campo: campo?.id,
        responsavel: inscricao.criado_por,
      });

      // 🔹 4. Gerar link de pagamento via API do Asaas
      const res = await fetch("/admin/api/asaas/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId: pedido.id,
          valor: pedido.valor,
        }),
      });

      const checkout = await res.json();

      if (!res.ok || !checkout?.url) {
        throw new Error("Erro ao gerar link de pagamento.");
      }

      // 4. Atualizar inscrição com o ID do pedido
      await pb
        .collection("inscricoes")
        .update(id, {
          pedido: pedido.id, // ✅ atualiza campo pedido
          status: "aguardando_pagamento",
          confirmado_por_lider: true,
        });

      // Atualizar estado local das inscrições
      setInscricoes((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "aguardando_pagamento",
                confirmado_por_lider: true,
              }
            : i
        )
      );

      // 🔹 6. Notificar via n8n webhook
      await fetch("/admin/api/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: inscricao.nome,
          telefone: inscricao.telefone,
          cpf: inscricao.cpf,
          evento: inscricao.evento,
          liderId: campo?.responsavel,
          pedidoId: pedido.id,
          valor: pedido.valor,
          url_pagamento: checkout.url,
        }),
      });

      // 🔹 7. Mostrar sucesso visual
      showSuccess("Link de pagamento enviado com sucesso!");
    } catch (err) {
      console.error("Erro ao confirmar inscrição:", err);
      showError("Erro ao confirmar inscrição e gerar pedido.");
    } finally {
      setConfirmandoId(null);
    }
  };

  const [inscricaoParaRecusar, setInscricaoParaRecusar] =
    useState<Inscricao | null>(null);

  const exportarCSV = () => {
    const header = [
      "Nome",
      "Telefone",
      "Evento",
      "Status",
      "Campo",
      "Criado em",
    ];
    const linhas = inscricoes.map((i) => [
      i.nome,
      i.telefone,
      i.evento,
      i.status,
      i.campo || "",
      new Date(i.created).toLocaleDateString("pt-BR"),
    ]);

    const csvContent = [header, ...linhas]
      .map((linha) => linha.map((valor) => `"${valor}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const hoje = new Date().toISOString().split("T")[0];
    saveAs(blob, `inscricoes_${hoje}.csv`);
  };

  const inscricoesFiltradas = inscricoes.filter((i) => {
    const busca = filtroBusca.toLowerCase();

    const matchStatus = filtroStatus === "" || i.status === filtroStatus;

    const matchBusca =
      filtroBusca === "" ||
      i.nome.toLowerCase().includes(busca) ||
      i.telefone?.toLowerCase().includes(busca) ||
      i.cpf?.toLowerCase().includes(busca) ||
      (role === "coordenador" && i.campo?.toLowerCase().includes(busca));

    return matchStatus && matchBusca;
  });

  const [pedidoSelecionado, setPedidoSelecionado] = useState<string | null>(
    null
  );

  if (loading)
    return <p className="p-6 text-center text-sm">Carregando inscrições...</p>;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="heading">Inscrições Recebidas</h2>

      {/* Link público */}
      {role === "lider" && (
        <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm shadow-sm">
          <p className="font-semibold mb-2">📎 Link de inscrição pública:</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              readOnly
              value={linkPublico}
              className="w-full p-2 border rounded bg-white text-gray-700 font-mono text-xs shadow-sm"
            />
            <button onClick={copiarLink} className="btn btn-primary text-xs">
              <Copy size={14} />
            </button>
          </div>
          {copiado && (
            <span className="text-green-600 text-xs animate-pulse mt-1 block">
              ✅ Link copiado
            </span>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder={placeholderBusca}
          className="border rounded px-4 py-2 text-sm w-full md:w-64 shadow-sm"
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
        />

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border rounded px-4 py-2 text-sm bg-white shadow-sm"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button
          onClick={exportarCSV}
          className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Exportar CSV
        </button>
      </div>

      {/* Tabela */}
      {inscricoesFiltradas.length === 0 ? (
        <p className="text-center text-gray-500">
          Nenhuma inscrição encontrada.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Evento</th>
                <th>Status</th>
                <th>Campo</th>
                <th>Criado em</th>
                <th>Confirmação</th>
                {role === "coordenador" && <th>Ação</th>}
              </tr>
            </thead>
            <tbody>
              {inscricoesFiltradas.map((i) => (
                <tr key={i.id}>
                  <td className="font-medium">{i.nome}</td>
                  <td>{i.telefone}</td>
                  <td>{i.evento}</td>
                  <td className="capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusBadge[i.status]
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td>{i.campo}</td>
                  <td>{new Date(i.created).toLocaleDateString("pt-BR")}</td>
                  <td className="text-left text-xs">
                    <div className="flex items-center gap-3">
                      {(role === "lider" || role === "coordenador") &&
                      i.status === "pendente" &&
                      !i.confirmado_por_lider ? (
                        <>
                          <TooltipIcon label="Confirmar inscrição">
                            <button
                              onClick={() => confirmarInscricao(i.id)}
                              disabled={confirmandoId === i.id}
                              className={`text-green-600 hover:text-green-700 cursor-pointer ${
                                confirmandoId === i.id ? "opacity-50" : ""
                              }`}
                            >
                              {confirmandoId === i.id ? (
                                <svg
                                  className="w-5 h-5 animate-spin text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                  ></path>
                                </svg>
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </button>
                          </TooltipIcon>

                          <TooltipIcon label="Recusar inscrição">
                            <button
                              onClick={() => setInscricaoParaRecusar(i)}
                              className="text-red-600 hover:text-red-700 cursor-pointer"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </TooltipIcon>
                        </>
                      ) : i.confirmado_por_lider ? (
                        <TooltipIcon label="Confirmado">
                          <CheckCircle className="text-green-600 w-5 h-5" />
                        </TooltipIcon>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 text-left text-xs">
                    <div className="flex items-center gap-3">
                      <TooltipIcon label="Editar">
                        <button
                          onClick={() => setInscricaoEmEdicao(i)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </TooltipIcon>

                      <TooltipIcon label="Excluir">
                        <button
                          onClick={() => deletarInscricao(i.id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TooltipIcon>

                      {i.pedido_id ? (
                        <TooltipIcon label="Visualizar pedido">
                          <button
                            onClick={() => setPedidoSelecionado(i.pedido_id!)}
                            className="text-purple-600 hover:text-purple-800 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </TooltipIcon>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {inscricaoEmEdicao && (
        <ModalEditarInscricao
          inscricao={inscricaoEmEdicao}
          onClose={() => setInscricaoEmEdicao(null)}
          onSave={async (dadosAtualizados: Partial<Inscricao>) => {
            await pb
              .collection("inscricoes")
              .update(inscricaoEmEdicao.id, dadosAtualizados);
            setInscricoes((prev) =>
              prev.map((i) =>
                i.id === inscricaoEmEdicao.id
                  ? { ...i, ...dadosAtualizados }
                  : i
              )
            );
            setInscricaoEmEdicao(null);
          }}
        />
      )}

      {inscricaoParaRecusar && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Recusar Inscrição</h2>
            <p className="text-sm text-gray-700 mb-4">
              Tem certeza que deseja recusar a inscrição de{" "}
              <strong>{inscricaoParaRecusar.nome}</strong>? Essa ação definirá o
              status como <strong className="text-red-600">cancelado</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setInscricaoParaRecusar(null)}
                className="btn btn-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await pb
                    .collection("inscricoes")
                    .update(inscricaoParaRecusar.id, {
                      status: "cancelado",
                    });
                  setInscricoes((prev) =>
                    prev.map((i) =>
                      i.id === inscricaoParaRecusar.id
                        ? { ...i, status: "cancelado" }
                        : i
                    )
                  );
                  setInscricaoParaRecusar(null);
                }}
                className="btn btn-danger text-sm"
              >
                Confirmar recusa
              </button>
            </div>
          </div>
        </div>
      )}

      {pedidoSelecionado && (
        <ModalVisualizarPedido
          pedidoId={pedidoSelecionado}
          onClose={() => setPedidoSelecionado(null)}
        />
      )}
    </main>
  );
}
