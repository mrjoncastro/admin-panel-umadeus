"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import pb from "@/lib/pocketbase";

export default function LiderDashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthContext();

  const [totais, setTotais] = useState({
    inscricoes: { pendente: 0, confirmado: 0, cancelado: 0 },
    pedidos: { pendente: 0, pago: 0, cancelado: 0, valorTotal: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== "lider") {
      router.replace("/");
      return;
    }

    const fetchDados = async () => {
      pb.autoCancellation(false);
      try {
        const campoId = user.campo;

        // Inscrições
        const [pendente, confirmado, cancelado] = await Promise.all([
          pb
            .collection("inscricoes")
            .getFullList({ filter: `campo="${campoId}" && status="pendente"` }),
          pb.collection("inscricoes").getFullList({
            filter: `campo="${campoId}" && status="confirmado"`,
          }),
          pb.collection("inscricoes").getFullList({
            filter: `campo="${campoId}" && status="cancelado"`,
          }),
        ]);

        // Pedidos
        const pedidos = await pb.collection("pedidos").getFullList({
          filter: `campo="${campoId}"`,
        });

        const resumoPedidos = {
          pendente: pedidos.filter((p) => p.status === "pendente").length,
          pago: pedidos.filter((p) => p.status === "pago").length,
          cancelado: pedidos.filter((p) => p.status === "cancelado").length,
          valorTotal: pedidos
            .filter((p) => p.status === "pago")
            .reduce((acc, p) => acc + Number(p.valor || 0), 0),
        };

        setTotais({
          inscricoes: {
            pendente: pendente.length,
            confirmado: confirmado.length,
            cancelado: cancelado.length,
          },
          pedidos: resumoPedidos,
        });
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [isLoggedIn, user, router]);

  if (loading) {
    return <p className="p-6 text-center text-sm">Carregando dashboard...</p>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="heading mb-6">Painel da Liderança</h1>

      {/* Cards Resumo */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Inscrições</h2>
          <p>Pendentes: {totais.inscricoes.pendente}</p>
          <p>Confirmadas: {totais.inscricoes.confirmado}</p>
          <p>Canceladas: {totais.inscricoes.cancelado}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Pedidos</h2>
          <p>Pendentes: {totais.pedidos.pendente}</p>
          <p>Pagos: {totais.pedidos.pago}</p>
          <p>Cancelados: {totais.pedidos.cancelado}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Total Arrecadado</h2>
          <p className="text-xl font-bold text-green-700">
            R$ {totais.pedidos.valorTotal.toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>
    </main>
  );
}
