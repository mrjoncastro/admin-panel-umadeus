"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import pb from "@/lib/pocketbase";
import DashboardAnalytics from "../components/DashboardAnalytics";
import type { Inscricao, Pedido } from "@/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function LiderDashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthContext();

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [totais, setTotais] = useState({
    inscricoes: { pendente: 0, confirmado: 0, cancelado: 0 },
    pedidos: { pendente: 0, pago: 0, cancelado: 0, valorTotal: 0 },
  });

  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== "lider") {
      router.replace("/");
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;
    const fetchDados = async () => {
      pb.autoCancellation(false);
      try {
        const campoId = user.campo;

        const [rawInscricoes, rawPedidos] = await Promise.all([
          pb
            .collection("inscricoes")
            .getFullList({ filter: `campo="${campoId}"`, expand: "campo,criado_por,pedido", signal }),
          pb
            .collection("pedidos")
            .getFullList({ filter: `campo="${campoId}"`, expand: "campo,criado_por", signal }),
        ]);

        if (!isMounted.current) return;

        const allInscricoes: Inscricao[] = rawInscricoes.map((r) => ({
          id: r.id,
          nome: r.nome,
          telefone: r.telefone,
          evento: r.evento,
          status: r.status,
          created: r.created,
          campo: r.campo,
          tamanho: r.tamanho,
          produto: r.produto,
          genero: r.genero,
          data_nascimento: r.data_nascimento,
          criado_por: r.criado_por,
          expand: {
            campo: r.expand?.campo,
            criado_por: r.expand?.criado_por,
            pedido: r.expand?.pedido,
          },
        }));

        const allPedidos: Pedido[] = rawPedidos.map((r) => ({
          id: r.id,
          id_inscricao: r.id_inscricao,
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

        setInscricoes(allInscricoes);
        setPedidos(allPedidos);

        const resumoPedidos = {
          pendente: allPedidos.filter((p) => p.status === "pendente").length,
          pago: allPedidos.filter((p) => p.status === "pago").length,
          cancelado: allPedidos.filter((p) => p.status === "cancelado").length,
          valorTotal: allPedidos
            .filter((p) => p.status === "pago")
            .reduce((acc, p) => acc + Number(p.valor || 0), 0),
        };

        const resumoInscricoes = {
          pendente: allInscricoes.filter((i) => i.status === "pendente").length,
          confirmado: allInscricoes.filter((i) => i.status === "confirmado").length,
          cancelado: allInscricoes.filter((i) => i.status === "cancelado").length,
        };

        setTotais({ inscricoes: resumoInscricoes, pedidos: resumoPedidos });
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchDados();
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [isLoggedIn, user, router]);

  if (loading) {
    return <p className="p-6 text-center text-sm">Carregando dashboard...</p>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="heading mb-6">Painel da Liderança</h1>

      {/* Cards Resumo */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="bg-white/90 backdrop-blur shadow rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Inscrições</h2>
          <p>Pendentes: {totais.inscricoes.pendente}</p>
          <p>Confirmadas: {totais.inscricoes.confirmado}</p>
          <p>Canceladas: {totais.inscricoes.cancelado}</p>
        </div>

        <div className="bg-white/90 backdrop-blur shadow rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Pedidos</h2>
          <p>Pendentes: {totais.pedidos.pendente}</p>
          <p>Pagos: {totais.pedidos.pago}</p>
          <p>Cancelados: {totais.pedidos.cancelado}</p>
        </div>

        <div className="bg-white/90 backdrop-blur shadow rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Total Arrecadado</h2>
          <p className="text-xl font-bold text-green-700">
            R$ {totais.pedidos.valorTotal.toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>
      <DashboardAnalytics inscricoes={inscricoes} pedidos={pedidos} />
    </main>
  );
}
