"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";

interface Saldo {
  disponivel: number;
  aLiberar: number;
  totalRecebido: number;
}

export default function FinanceiroPage() {
  const { tenantId, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [saldo, setSaldo] = useState<Saldo | null>(null);
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
        const res = await fetch(`/admin/api/asaas/saldo`);
        if (res.ok) {
          const data = await res.json();
          setSaldo(data);
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
        <p className="text-center">Carregando...</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Saldo Disponível</h3>
              <p className="text-xl font-bold">
                {typeof saldo?.disponivel === "number"
                  ? `R$ ${saldo.disponivel.toFixed(2)}`
                  : "—"}
              </p>
            </div>
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">A Liberar</h3>
              <p className="text-xl font-bold">
                {typeof saldo?.aLiberar === "number"
                  ? `R$ ${saldo.aLiberar.toFixed(2)}`
                  : "—"}
              </p>
            </div>
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Total Recebido</h3>
              <p className="text-xl font-bold">
                {typeof saldo?.totalRecebido === "number"
                  ? `R$ ${saldo.totalRecebido.toFixed(2)}`
                  : "—"}
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
