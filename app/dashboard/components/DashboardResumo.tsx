import { Bar, Pie } from "react-chartjs-2";
import { Info } from "lucide-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import type { Inscricao, Pedido } from "@/types";

interface DashboardResumoProps {
  inscricoes: Inscricao[];
  pedidos: Pedido[];
  valorTotal: number;
  filtroStatus: string;
  setFiltroStatus: (status: string) => void;
}

export default function DashboardResumo({
  inscricoes,
  pedidos,
  valorTotal,
  filtroStatus,
  setFiltroStatus,
}: DashboardResumoProps) {
  const statusInscricoes = inscricoes.reduce<Record<string, number>>(
    (acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const statusPedidos = pedidos.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const inscricoesChart = {
    labels: inscricoes.map((i) => i.expand?.campo?.nome || "Sem campo"),
    datasets: [
      {
        label: "Inscrições",
        data: inscricoes.map(() => 1),
        backgroundColor: "#DCDCDD",
      },
    ],
  };

  const pedidosChart = (() => {
    const filtrados = pedidos.filter((p) => p.status === filtroStatus);
    const contagem = filtrados.reduce<Record<string, number>>((acc, p) => {
      const campo = p.expand?.campo?.nome || "Sem campo";
      acc[campo] = (acc[campo] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(contagem),
      datasets: [
        {
          label: `Pedidos (${filtroStatus})`,
          data: Object.values(contagem),
          backgroundColor: ["#DCDCDD", "#c94a4a", "#0ea5e9"],
        },
      ],
    };
  })();

  return (
    <>
      {/* Totais principais */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold">Total de Inscrições</h2>
            <Tippy content="Todas as inscrições feitas no sistema.">
              <span>
                <Info className="w-4 h-4 text-cornell_red" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold">{inscricoes.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold">Total de Pedidos</h2>
            <Tippy content="Todos os pedidos gerados.">
              <span>
                <Info className="w-4 h-4 text-cornell_red" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold">{pedidos.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold">Valor Total</h2>
            <Tippy content="Soma de todos os valores dos pedidos.">
              <span>
                <Info className="w-4 h-4 text-cornell_red" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold">R$ {valorTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Status */}
      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 mb-4">
        {["pendente", "confirmado", "cancelado"].map((status) => (
          <div
            key={status}
            className="bg-[#F7F7F7] p-3 rounded-md shadow-sm text-center"
          >
            <h3 className="text-sm font-semibold">
              Inscrições {status.charAt(0).toUpperCase() + status.slice(1)}
            </h3>
            <p className="text-xl font-bold">{statusInscricoes[status] || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 mb-8">
        {["pendente", "pago", "cancelado"].map((status) => (
          <div
            key={status}
            className="bg-[#F7F7F7] p-3 rounded-md shadow-sm text-center"
          >
            <h3 className="text-sm font-semibold">
              Pedidos {status.charAt(0).toUpperCase() + status.slice(1)}
            </h3>
            <p className="text-xl font-bold">{statusPedidos[status] || 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#F1F1F1] rounded-lg p-6 shadow-inner mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <label className="text-sm font-medium text-black_bean">Filtro:</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 rounded-md bg-black_bean text-platinum border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-cornell_red w-full md:w-64"
          >
            {["pago", "pendente", "cancelado"].map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-black_bean">
                Inscrições por Campo
              </h3>
              <Tippy content="Distribuição de inscrições por campo de atuação.">
                <span>
                  <Info className="w-4 h-4 text-cornell_red" />
                </span>
              </Tippy>
            </div>
            <div className="aspect-video">
              <Bar
                data={inscricoesChart}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-black_bean">
                Pedidos por Campo
              </h3>
              <Tippy
                content={`Distribuição dos pedidos com status "${filtroStatus}" por campo.`}
              >
                <span>
                  <Info className="w-4 h-4 text-cornell_red" />
                </span>
              </Tippy>
            </div>
            <div className="aspect-video">
              <Pie
                data={pedidosChart}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
