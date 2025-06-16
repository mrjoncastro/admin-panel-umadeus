"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useState, useEffect } from "react";
import TransferenciaForm from "@/app/admin/financeiro/transferencias/components/TransferenciaForm";
import BankAccountModal from "@/app/admin/financeiro/transferencias/modals/BankAccountModal";

export default function TransferenciasPage() {
  const { isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [mensagem, setMensagem] = useState("");
  const [openAccountModal, setOpenAccountModal] = useState(false);

  async function handleTransfer(
    destino: string,
    valor: number,
    description: string
  ) {
    const res = await fetch("/admin/api/asaas/transferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankAccountId: destino, valor, description }),
    });
    if (res.ok) {
      setMensagem("Transferência enviada!");
    } else {
      setMensagem("Erro ao transferir.");
    }
  }

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h2 className="heading mb-6">Transferências</h2>
      {mensagem && <p className="mb-4">{mensagem}</p>}
      <button
        type="button"
        className="btn btn-secondary mb-4"
        onClick={() => setOpenAccountModal(true)}
      >
        Nova conta
      </button>
      <TransferenciaForm onTransfer={handleTransfer} />
      <BankAccountModal
        open={openAccountModal}
        onClose={() => setOpenAccountModal(false)}
      />
    </main>
  );
}
