"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { setupCharts } from "@/lib/chartSetup";
import { Info } from "lucide-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import type { Inscricao, Pedido } from "@/types";

const Bar = dynamic(() => import("react-chartjs-2").then((m) => m.Bar), {
  ssr: false,
});
const Pie = dynamic(() => import("react-chartjs-2").then((m) => m.Pie), {
  ssr: false,
});

interface DashboardResumoProps {
  inscricoes: Inscricao[];
  pedidos: Pedido[];
  filtroStatus: string;
  setFiltroStatus: (status: string) => void;
}

export default function DashboardResumo({
  inscricoes,
  pedidos,
  filtroStatus,
  setFiltroStatus,
}: DashboardResumoProps) {
  useEffect(() => {
    setupCharts();
  }, []);
  const valorTotalConfirmado = inscricoes.reduce((total, i) => {
    const pedido = i.expand?.pedido;
    const confirmado =
      i.status === "confirmado" || i.confirmado_por_lider === true;
    const pago = pedido?.status === "pago";
    const valor = Number(pedido?.valor ?? 0);

    if (confirmado && pago && !isNaN(valor)) {
      return total + valor;
    }

    return total;
  }, 0);


  const statusInscricoes = inscricoes.reduce<Record<string, number>>(
    (acc, i) => {
      if (i.status) {
        acc[i.status] = (acc[i.status] || 0) + 1;
      }
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
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="card text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold">Total de Inscrições</h2>
            <Tippy content="Todas as inscrições feitas no sistema.">
              <span>
                <Info className="w-4 h-4 text-red-600" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold">{inscricoes.length}</p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold">Total de Pedidos</h2>
            <Tippy content="Todos os pedidos gerados.">
              <span>
                <Info className="w-4 h-4 text-red-600" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold">{pedidos.length}</p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold">Valor Total</h2>
            <Tippy content="Soma dos pedidos pagos com inscrições confirmadas.">
              <span>
                <Info className="w-4 h-4 text-red-600" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold">
            R$ {valorTotalConfirmado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 mb-4">
        {["pendente", "confirmado", "cancelado"].map((status) => (
          <div
            key={status}
            className="bg-white/70 backdrop-blur p-3 rounded-lg shadow text-center"
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
            className="bg-white/70 backdrop-blur p-3 rounded-lg shadow text-center"
          >
            <h3 className="text-sm font-semibold">
              Pedidos {status.charAt(0).toUpperCase() + status.slice(1)}
            </h3>
            <p className="text-xl font-bold">{statusPedidos[status] || 0}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="bg-white/70 backdrop-blur rounded-xl p-6 shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-100">Filtro:</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 rounded-md bg-gray-800 text-gray-100 border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 w-full md:w-64"
          >
            {["pago", "pendente", "cancelado"].map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Inscrições por Campo
              </h3>
              <Tippy content="Distribuição de inscrições por campo de atuação.">
                <span>
                  <Info className="w-4 h-4 text-red-600" />
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

          <div className="card p-5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Pedidos por Campo
              </h3>
              <Tippy
                content={`Distribuição dos pedidos com status "${filtroStatus}" por campo.`}
              >
                <span>
                  <Info className="w-4 h-4 text-red-600" />
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
