"use client";

import { useState, useEffect } from "react";
import usePocketBase from "@/lib/hooks/usePocketBase";
import { useAuthContext } from "@/lib/context/AuthContext";
import { getBankAccountsByTenant, type ClienteContaBancariaRecord } from "@/lib/bankAccounts";

interface TransferenciaFormProps {
  onTransfer?: (destino: string, valor: number) => Promise<void> | void;
}

export default function TransferenciaForm({
  onTransfer,
}: TransferenciaFormProps) {
  const [destino, setDestino] = useState("");
  const [valor, setValor] = useState("");
  const [contas, setContas] = useState<ClienteContaBancariaRecord[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const pb = usePocketBase();
  const { tenantId } = useAuthContext();

  useEffect(() => {
    if (!tenantId) return;
    getBankAccountsByTenant(pb, tenantId)
      .then(setContas)
      .catch(() => setContas([]));
  }, [pb, tenantId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const parsed = Number(valor);
    if (!destino || isNaN(parsed) || parsed <= 0) {
      setErro("Dados inv\u00e1lidos.");
      return;
    }
    setLoading(true);
    try {
      await onTransfer?.(destino, parsed);
    } catch {
      setErro("Erro ao transferir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      {erro && <p className="text-sm text-error-600">{erro}</p>}
      <select
        className="input-base"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
      >
        <option value="">Selecione a conta</option>
        {contas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.accountName} / {c.ownerName}
          </option>
        ))}
      </select>
      <input
        type="number"
        className="input-base"
        placeholder="Valor (R$)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Enviando..." : "Transferir"}
      </button>
    </form>
  );
}
