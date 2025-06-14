"use client";

import { useAuthContext } from "@/lib/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface Saldo {
  disponivel: number;
  aLiberar: number;
  totalRecebido: number;
}

interface ExtratoItem {
  id: string;
  description: string;
  value: number;
  type: string;
  date: string;
}

export default function SaldoPage() {
  const { isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [extrato, setExtrato] = useState<ExtratoItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const saldoRes = await fetch("/admin/api/asaas/saldo");
        if (saldoRes.ok) {
          setSaldo(await saldoRes.json());
        }
        const extratoRes = await fetch("/admin/api/asaas/extrato");
        if (extratoRes.ok) {
          const data = await extratoRes.json();
          setExtrato(data.data || []);
        }
      } catch (err) {
        console.error("Erro ao obter dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn, router]);

  const exportXLSM = () => {
    const worksheet = XLSX.utils.json_to_sheet(extrato);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extrato");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "extrato.xlsm");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Extrato", 10, 10);
    extrato.forEach((t, i) => {
      doc.text(
        `${t.date} - ${t.description} - R$ ${t.value.toFixed(2)}`,
        10,
        20 + i * 10
      );
    });
    doc.save("extrato.pdf");
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="heading mb-6">Saldo</h2>
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
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Extrato</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-2">Data</th>
                    <th className="px-2">Descrição</th>
                    <th className="px-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {extrato.map((t) => (
                    <tr key={t.id}>
                      <td className="px-2">{t.date}</td>
                      <td className="px-2">{t.description}</td>
                      <td className="px-2">
                        {typeof t.value === "number" ? t.value.toFixed(2) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={exportPDF} className="btn btn-secondary">
                Exportar PDF
              </button>
              <button onClick={exportXLSM} className="btn btn-secondary">
                Exportar XLSM
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
