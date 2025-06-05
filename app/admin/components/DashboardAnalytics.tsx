"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import type { Inscricao, Pedido } from "@/types";

const LineChart = dynamic(() => import("react-chartjs-2").then((m) => m.Line), {
  ssr: false,
});
const BarChart = dynamic(() => import("react-chartjs-2").then((m) => m.Bar), {
  ssr: false,
});

interface DashboardAnalyticsProps {
  inscricoes: Inscricao[];
  pedidos: Pedido[];
}

function groupByDate(
  items: { created?: string }[],
  start?: string,
  end?: string
) {
  const counts: Record<string, number> = {};
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  items.forEach((i) => {
    if (!i.created) return;
    const dateObj = new Date(i.created);
    if (startDate && dateObj < startDate) return;
    if (endDate && dateObj > endDate) return;
    const d = dateObj.toISOString().slice(0, 10);
    counts[d] = (counts[d] || 0) + 1;
  });
  const dates = Object.keys(counts).sort();
  return { labels: dates, data: dates.map((d) => counts[d]) };
}

export default function DashboardAnalytics({ inscricoes, pedidos }: DashboardAnalyticsProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    import("chart.js/auto");
  }, []);

  const inscricoesData = groupByDate(inscricoes, startDate, endDate);
  const pedidosData = groupByDate(pedidos, startDate, endDate);

  const inscricoesChart = {
    labels: inscricoesData.labels,
    datasets: [
      {
        label: "Inscrições",
        data: inscricoesData.data,
        fill: true,
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124,58,237,0.2)",
      },
    ],
  };

  const pedidosChart = {
    labels: pedidosData.labels,
    datasets: [
      {
        label: "Pedidos",
        data: pedidosData.data,
        fill: true,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14,165,233,0.2)",
      },
    ],
  };

  const filteredPedidos = pedidos.filter((p) => {
    if (!p.created) return false;
    const dateObj = new Date(p.created);
    if (startDate && dateObj < new Date(startDate)) return false;
    if (endDate && dateObj > new Date(endDate)) return false;
    return true;
  });

  const valores = filteredPedidos.map((p) => Number(p.valor) || 0);
  const mediaValor = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;

  const arrecadacaoCampo: Record<string, number> = {};
  filteredPedidos.forEach((p) => {
    if (p.status === "pago") {
      const campo = p.expand?.campo?.nome || "Sem campo";
      const v = Number(p.valor) || 0;
      arrecadacaoCampo[campo] = (arrecadacaoCampo[campo] || 0) + v;
    }
  });

  const arrecadacaoLabels = Object.keys(arrecadacaoCampo);
  const arrecadacaoChart = {
    labels: arrecadacaoLabels,
    datasets: [
      {
        label: "Arrecadação (R$)",
        data: arrecadacaoLabels.map((l) => arrecadacaoCampo[l]),
        backgroundColor: "#8b5cf6",
      },
    ],
  };

  const handleExportCSV = () => {
    const rows = inscricoesData.labels.map((d, idx) => ({
      Data: d,
      Inscricoes: inscricoesData.data[idx] || 0,
      Pedidos: pedidosData.data[idx] || 0,
    }));

    const csvHeader = "Data,Inscrições,Pedidos\n";
    const csvRows = rows
      .map((r) => `${r.Data},${r.Inscricoes},${r.Pedidos}`)
      .join("\n");
    const blob = new Blob([csvHeader + csvRows], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, "dashboard.csv");
  };

  const handleExportXLSX = () => {
    const rows = inscricoesData.labels.map((d, idx) => ({
      Data: d,
      Inscricoes: inscricoesData.data[idx] || 0,
      Pedidos: pedidosData.data[idx] || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "dashboard.xlsx");
  };

  return (
    <div className="bg-white/70 backdrop-blur p-6 rounded-xl shadow-md mb-8">
      <h3 className="text-lg font-semibold mb-4">Análises Temporais e Financeiras</h3>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="inicio">Início:</label>
          <input
            id="inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="fim">Fim:</label>
          <input
            id="fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-primary text-sm px-3 py-1 rounded"
        >
          Exportar CSV
        </button>
        <button
          onClick={handleExportXLSX}
          className="btn-primary text-sm px-3 py-1 rounded"
        >
          Exportar XLSX
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/90 p-4 rounded-lg shadow">
          <h4 className="font-medium mb-2">Evolução de Inscrições</h4>
          <div className="aspect-video">
            <LineChart data={inscricoesChart} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white/90 p-4 rounded-lg shadow">
          <h4 className="font-medium mb-2">Evolução de Pedidos</h4>
          <div className="aspect-video">
            <LineChart data={pedidosChart} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/90 p-4 rounded-lg shadow flex flex-col justify-center items-center">
          <p className="text-sm">Média de Valor por Pedido</p>
          <p className="text-2xl font-bold">R$ {mediaValor.toFixed(2).replace(".", ",")}</p>
        </div>
        <div className="bg-white/90 p-4 rounded-lg shadow">
          <h4 className="font-medium mb-2">Arrecadação por Campo</h4>
          <div className="aspect-video">
            <BarChart data={arrecadacaoChart} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}
