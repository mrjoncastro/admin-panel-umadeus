"use client";

import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useEffect, useRef, useState } from "react";
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
import DashboardResumo from "./components/DashboardResumo";
import DashboardAnalytics from "../components/DashboardAnalytics";

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

export default function DashboardPage() {
  const { user, pb, authChecked } = useAuthGuard(["coordenador", "lider"]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("pago");
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
            .getFullList({ expand: "campo,criado_por,pedido", signal }),
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
          campo: r.campo,
          tamanho: r.tamanho,
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
          id_inscricao:r.id_inscricao,
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
          setPedidos(allPedidos.filter((p) => p.expand?.campo?.id === campoId));
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



  return (
    <main className="min-h-screen bg-[#DCDCDC] text-[#2A1A1C] p-4 md:p-6">
      {!authChecked || !user || loading ? (
        <p className="text-center text-xl font-semibold">
          Carregando painel...
        </p>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h1 className="heading">
              Painel de{" "}
              {user.role === "coordenador" ? "Coordenação" : "Liderança"}
            </h1>
            <p className="text-sm text-gray-700 mt-1">
              Bem-vindo(a), <span className="font-semibold">{user.nome}</span>!
            </p>
          </div>

          <DashboardResumo
            inscricoes={inscricoes}
            pedidos={pedidos}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
          />
          <DashboardAnalytics inscricoes={inscricoes} pedidos={pedidos} />
        </>
      )}
    </main>
  );
}
