"use client";

import { useState } from "react";

// ✅ Validação formal de CPF
function validarCPF(cpf: string): boolean {
  const str = cpf.replace(/\D/g, "");
  if (str.length !== 11 || /^(\d)\1+$/.test(str)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(str.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(str.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(str.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(str.charAt(10));
}

export default function RecuperarPagamentoPage() {
  const [cpfOuTelefone, setCpfOuTelefone] = useState("");
  const [resultado, setResultado] = useState("");
  const [link, setLink] = useState("");
  const [carregando, setCarregando] = useState(false);

  const aplicarMascara = (valor: string): string => {
    const numeros = valor.replace(/\D/g, "");

    if (validarCPF(numeros)) {
      return numeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    if (numeros.length <= 11) {
      return numeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    }

    return valor;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setCpfOuTelefone(aplicarMascara(valor));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultado("");
    setLink("");
    setCarregando(true);

    const numeros = cpfOuTelefone.replace(/\D/g, "");
    const isCPFValido = validarCPF(numeros);

    const payload = isCPFValido ? { cpf: numeros } : { telefone: numeros };

    try {
      const res = await fetch("/api/recuperar-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setResultado(data.error || "Erro ao buscar inscrição.");
      } else if (data.status === "pago") {
        setResultado("✅ Seu pagamento já foi confirmado.");
      } else if (data.status === "cancelado") {
        setResultado("❌ Esse pedido foi cancelado.");
      } else if (data.status === "pendente" && data.link_pagamento) {
        setResultado("🔗 Clique no botão abaixo para finalizar o pagamento:");
        setLink(data.link_pagamento);
      }
    } catch {
      setResultado("Erro ao tentar recuperar o link.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-12 bg-white rounded-xl shadow-lg text-gray-700 font-sans">
      <h1 className="text-xl font-bold text-purple-700 mb-4 text-center">
        Recuperar Link de Pagamento
      </h1>
      <p className="text-sm text-center mb-6">
        Informe o <strong>CPF</strong> ou <strong>telefone</strong> utilizado na
        inscrição:
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={cpfOuTelefone}
          onChange={handleChange}
          placeholder="CPF ou Telefone"
          required
          className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
        />

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md transition"
        >
          {carregando ? "Verificando..." : "Recuperar Link"}
        </button>
      </form>

      {resultado && (
        <div className="mt-6 text-center text-sm space-y-2">
          <p>{resultado}</p>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition"
            >
              Ir para o pagamento
            </a>
          )}
        </div>
      )}
    </div>
  );
}
