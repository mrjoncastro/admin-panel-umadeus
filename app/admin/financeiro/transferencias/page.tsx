"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useState } from "react";
import TransferenciaForm from "@/components/TransferenciaForm";

export default function TransferenciasPage() {
  const { isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [mensagem, setMensagem] = useState("");

  async function handleTransfer(destino: string, valor: number) {
    const res = await fetch("/admin/api/asaas/transferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankAccountId: destino, valor }),
    });
    if (res.ok) {
      setMensagem("Transferência enviada!");
    } else {
      setMensagem("Erro ao transferir.");
    }
  }

  if (!isLoggedIn) {
    router.replace("/login");
    return null;
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h2 className="heading mb-6">Transferências</h2>
      {mensagem && <p className="mb-4">{mensagem}</p>}
      <TransferenciaForm onTransfer={handleTransfer} />
    </main>
  );
}
