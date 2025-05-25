"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import { Copy } from "lucide-react";
import { saveAs } from "file-saver";
import ModalEditarInscricao from "./componentes/ModalEdit";

const statusBadge = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

type Inscricao = {
  id: string;
  nome: string;
  telefone: string;
  cpf: string;
  evento: string;
  status: keyof typeof statusBadge;
  created: string;
  campo?: string;
  tamanho?: string;
  genero?: string;
  data_nascimento?: string;
  criado_por?: string;
};

export default function ListaInscricoesPage() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [role, setRole] = useState("");
  const [linkPublico, setLinkPublico] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [inscricaoEmEdicao, setInscricaoEmEdicao] = useState<Inscricao | null>(
    null
  );

  useEffect(() => {
    const user = pb.authStore.model;

    if (!user?.id || !user?.role) {
      setErro("Sessão expirada ou inválida.");
      setLoading(false);
      return;
    }

    pb.autoCancellation(false);

    setRole(user.role);
    setLinkPublico(`${window.location.origin}/inscricoes/${user.id}`);

    const filtro = user.role === "coordenador" ? "" : `campo='${user.campo}'`;

    pb.collection("inscricoes")
      .getFullList({ sort: "-created", filter: filtro, expand: "campo" })
      .then((res) => {
        const lista = res.map((r) => ({
          id: r.id,
          nome: r.nome,
          telefone: r.telefone,
          evento: r.evento,
          cpf: r.evento,
          status: r.status,
          created: r.created,
          campo: r.expand?.campo?.nome || "—",
          tamanho: r.tamanho,
          genero: r.genero,
          data_nascimento: r.data_nascimento,
          criado_por: r.criado_por,
        }));
        setInscricoes(lista);
      })
      .catch(() => setErro("Erro ao carregar inscrições."))
      .finally(() => setLoading(false));

    if (user.role === "coordenador") {
      pb.collection("campos")
        .getFullList({ sort: "nome" })
        .then((res) => {
          const nomes = res.map((c) =>
            typeof c === "object" && c !== null && "nome" in c
              ? String(c.nome)
              : "Indefinido"
          );
          // Se ainda for usar camposDisponiveis no futuro:
          // setCamposDisponiveis(nomes);
          console.log("Campos disponíveis:", nomes);
        })
        .catch(() => {});
    }
  }, []);

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkPublico);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("Não foi possível copiar o link.");
    }
  };

  const deletarInscricao = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta inscrição?")) {
      try {
        await pb.collection("inscricoes").delete(id);
        setInscricoes((prev) => prev.filter((i) => i.id !== id));
      } catch {
        setErro("Erro ao excluir inscrição.");
      }
    }
  };

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

  if (loading)
    return <p className="p-6 text-center text-sm">Carregando inscrições...</p>;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-black_bean mb-6">
        Inscrições Recebidas
      </h1>

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
            <button
              onClick={copiarLink}
              className="bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition"
            >
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

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-2 rounded mb-6">
          {erro}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome, telefone, CPF ou campo"
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
          <table className="min-w-full divide-y divide-gray-200 text-sm bg-white">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wide">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Telefone</th>
                <th className="p-3 text-left">Evento</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Campo</th>
                <th className="p-3 text-left">Criado em</th>
                {role === "coordenador" && (
                  <th className="p-3 text-left">Ação</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inscricoesFiltradas.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{i.nome}</td>
                  <td className="p-3">{i.telefone}</td>
                  <td className="p-3">{i.evento}</td>
                  <td className="p-3 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusBadge[i.status]
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="p-3">{i.campo}</td>
                  <td className="p-3">
                    {new Date(i.created).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3 text-right space-x-3 text-xs">
                    {role === "coordenador" ? (
                      <>
                        <button
                          onClick={() => setInscricaoEmEdicao(i)}
                          className="text-blue-600 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletarInscricao(i.id)}
                          className="text-red-600 hover:underline"
                        >
                          Excluir
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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
    </main>
  );
}
