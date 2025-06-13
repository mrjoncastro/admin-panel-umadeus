"use client";

import { useState } from "react";

interface TransferenciaFormProps {
  onTransfer?: (destino: string, valor: number) => Promise<void> | void;
}

export default function TransferenciaForm({
  onTransfer,
}: TransferenciaFormProps) {
  const [destino, setDestino] = useState("");
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

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
      <input
        type="text"
        className="input-base"
        placeholder="Destinat\u00e1rio"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
      />
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
