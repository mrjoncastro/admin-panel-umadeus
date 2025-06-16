"use client";

import { useState, useEffect } from "react";

const BRASILAPI_URL =
  process.env.NEXT_PUBLIC_BRASILAPI_URL || "https://brasilapi.com.br/api";

interface TransferenciaFormProps {
  onTransfer?: (destino: string, valor: number) => Promise<void> | void;
}

export default function TransferenciaForm({
  onTransfer,
}: TransferenciaFormProps) {
  const [destino, setDestino] = useState("");
  const [valor, setValor] = useState("");
  const [bancos, setBancos] = useState<{ ispb: string; nome: string }[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BRASILAPI_URL}/banks/v1`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setBancos(data);
        }
      })
      .catch(() => {
        console.warn("Erro ao carregar bancos da BrasilAPI");
      });
  }, []);

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
      {bancos.length ? (
        <select
          className="input-base"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        >
          <option value="">Selecione o banco</option>
          {bancos.map((b) => (
            <option key={b.ispb} value={b.ispb}>
              {b.nome}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          className="input-base"
          placeholder="Destinat\u00e1rio"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />
      )}
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
