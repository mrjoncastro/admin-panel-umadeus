"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useAuthContext } from "@/lib/context/AuthContext";

interface Statistics {
  netValue: number;
}

export default function FinanceiroPage() {
  const { tenantId, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [saldoDisponivel, setSaldoDisponivel] = useState<number | null>(null);
  const [aLiberar, setALiberar] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (!tenantId) return;
    const fetchSaldo = async () => {
      try {
        setLoading(true);
        const saldoRes = await fetch(`/admin/api/asaas/saldo`);
        if (saldoRes.ok) {
          const data: { balance: number } = await saldoRes.json();
          setSaldoDisponivel(data.balance);
        }
        const statsRes = await fetch(
          `/admin/api/asaas/estatisticas?status=PENDING`,
        );
        if (statsRes.ok) {
          const stats: Statistics = await statsRes.json();
          setALiberar(stats.netValue);
        }
      } catch (err) {
        console.error("Erro ao obter saldo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaldo();
  }, [tenantId, isLoggedIn, router]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="heading mb-6">Financeiro</h2>
      {loading ? (
        <LoadingOverlay show={true} text="Carregando..." />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Saldo Disponível</h3>
              <p className="text-xl font-bold">
                {typeof saldoDisponivel === "number"
                  ? `R$ ${saldoDisponivel.toFixed(2)}`
                  : "—"}
              </p>
            </div>
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">A Liberar</h3>
              <p className="text-xl font-bold">
                {typeof aLiberar === "number" ? `R$ ${aLiberar.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn btn-primary">Transferir Saldo</button>
          </div>
        </>
      )}
    </main>
  );
}
