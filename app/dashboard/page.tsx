"use client";

import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useEffect, useMemo, useState, useRef } from "react";
import type { Inscricao, Pedido } from "@/types";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const { user, pb, authChecked } = useAuthGuard(["coordenador", "lider"]);

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!authChecked || !user?.id || !user?.role) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const expandedUser = await pb.collection("usuarios").getOne(user.id, {
          expand: "campo",
          signal,
        });

        const [rawInscricoes, rawPedidos] = await Promise.all([
          pb
            .collection("inscricoes")
            .getFullList({ expand: "campo,criado_por", signal }),
          pb
            .collection("pedidos")
            .getFullList({ expand: "campo,criado_por", signal }),
        ]);

        if (!isMounted.current) return;

        const campoId = expandedUser.expand?.campo?.id;

        const allInscricoes: Inscricao[] = rawInscricoes.map((r) => ({
          id: r.id,
          nome: r.nome,
          telefone: r.telefone,
          evento: r.evento,
          status: r.status,
          created: r.created,
          campo: r.campo, // ✅ apenas o ID
          tamanho: r.tamanho,
          genero: r.genero,
          data_nascimento: r.data_nascimento,
          criado_por: r.criado_por,
          expand: {
            campo: r.expand?.campo,
            criado_por: r.expand?.criado_por,
          },
        }));

        const allPedidos: Pedido[] = rawPedidos.map((r) => ({
          id: r.id,
          produto: r.produto,
          email: r.email,
          tamanho: r.tamanho,
          cor: r.cor,
          status: r.status,
          valor: r.valor,
          id_pagamento: r.id_pagamento,
          created: r.created,
          campo: r.campo,
          genero: r.genero,
          evento: r.evento,
          data_nascimento: r.data_nascimento,
          responsavel: r.responsavel,
          expand: {
            campo: r.expand?.campo,
            criado_por: r.expand?.criado_por,
          },
        }));

        if (user.role === "coordenador") {
          setInscricoes(allInscricoes);
          setPedidos(allPedidos);
        } else {
          setInscricoes(allInscricoes.filter((i) => i.campo === campoId));
          setPedidos(allPedidos.filter((p) => p.expand?.campo === campoId));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Erro no dashboard:", err.message);
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [authChecked, user?.id, user?.role, pb]);

  const inscricoesPorCampo = useMemo(() => {
    return inscricoes.reduce<Record<string, number>>((acc, i) => {
      const campo = i.expand?.campo?.nome || "Sem campo";
      acc[campo] = (acc[campo] || 0) + 1;
      return acc;
    }, {});
  }, [inscricoes]);

  const pedidosPorCampo = useMemo(() => {
    return pedidos.reduce<Record<string, number>>((acc, p) => {
      const campo = p.expand?.campo?.nome || "Sem campo";
      acc[campo] = (acc[campo] || 0) + 1;
      return acc;
    }, {});
  }, [pedidos]);

  const valorTotal = useMemo(() => {
    return pedidos.reduce((soma, p) => soma + (parseFloat(p.valor) || 0), 0);
  }, [pedidos]);

  const inscricoesChart = useMemo(
    () => ({
      labels: Object.keys(inscricoesPorCampo),
      datasets: [
        {
          label: "Inscrições",
          data: Object.values(inscricoesPorCampo),
          backgroundColor: "#DCDCDD",
        },
      ],
    }),
    [inscricoesPorCampo]
  );

  const pedidosChart = useMemo(
    () => ({
      labels: Object.keys(pedidosPorCampo),
      datasets: [
        {
          label: "Pedidos",
          data: Object.values(pedidosPorCampo),
          backgroundColor: [
            "#DCDCDD",
            "#a8a8a8",
            "#8c8c8c",
            "#c94a4a",
            "#7c3aed",
            "#0ea5e9",
          ],
        },
      ],
    }),
    [pedidosPorCampo]
  );

  if (!authChecked || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#DCDCDC]">
        <p className="text-[#2A1A1C] text-lg font-semibold">
          Carregando painel...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#DCDCDC] text-[#2A1A1C] p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-[#DCDCDC] rounded">
        <h1 className="text-2xl font-bold mb-2">
          Painel de {user.role === "coordenador" ? "Coordenação" : "Liderança"}
        </h1>
        <p className="mb-6 font-bold">
          Bem-vindo, <strong>{user.nome}</strong>!
        </p>

        {loading ? (
          <p className="font-bold">Carregando dados...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="bg-white p-4 rounded shadow text-center">
              <h2 className="text-sm font-bold">Total de Inscrições</h2>
              <p className="text-3xl font-bold">{inscricoes.length}</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <h2 className="text-sm font-bold">Total de Pedidos</h2>
              <p className="text-3xl font-bold">{pedidos.length}</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <h2 className="text-sm font-bold">Valor Total</h2>
              <p className="text-3xl font-bold">R$ {valorTotal.toFixed(2)}</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Inscrições por Campo</h3>
              <div className="aspect-[4/3] max-h-[400px]">
                <Bar
                  data={inscricoesChart}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Pedidos por Campo</h3>
              <div className="aspect-[4/3] max-h-[400px]">
                <Pie
                  data={pedidosChart}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
