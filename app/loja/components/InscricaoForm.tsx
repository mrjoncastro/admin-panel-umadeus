"use client";

import { useState, useEffect } from "react";

const N8N_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://SEU_WEBHOOK_DO_N8N";

interface Campo {
  id: string;
  nome: string;
}

interface InscricaoFormProps {
  eventoId: string;
}

export default function InscricaoForm({ eventoId }: InscricaoFormProps) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [campos, setCampos] = useState<Campo[]>([]);

  useEffect(() => {
    fetch("/api/campos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => (Array.isArray(data) ? setCampos(data) : setCampos([])))
      .catch((err) => console.error("Erro ao carregar campos:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data)),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8 my-10 font-sans text-gray-800">
      {status === "success" && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded shadow-sm">
          Inscrição enviada com sucesso!
        </div>
      )}
      {status === "error" && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          Erro ao enviar a inscrição. Tente novamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="evento" value={eventoId} />
        <div className="grid md:grid-cols-2 gap-10">
          {/* Dados Pessoais */}
          <section>
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
              Dados Pessoais
            </h3>

            {/* Linhas agrupadas em pares */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Nome*
                  </label>
                  <input
                    name="user_first_name"
                    required
                    className="input-base"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Sobrenome*
                  </label>
                  <input
                    name="user_last_name"
                    required
                    className="input-base"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    E-mail*
                  </label>
                  <input
                    type="email"
                    name="user_email"
                    required
                    className="input-base"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Telefone*
                  </label>
                  <input
                    type="tel"
                    name="user_phone"
                    required
                    className="input-base"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">CPF*</label>
                  <input name="user_cpf" required className="input-base" />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Data de Nascimento*
                  </label>
                  <input
                    type="date"
                    name="user_birth_date"
                    required
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Campo*</label>
                <select name="campo" required className="input-base">
                  <option value="">Selecione</option>
                  {campos.map((campo) => (
                    <option key={campo.id} value={campo.id}>
                      {campo.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Gênero*
                </label>
                <select name="user_gender" required className="input-base">
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
            </div>
          </section>

          {/* Endereço */}
          <section>
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
              Endereço
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">CEP*</label>
                <input name="user_cep" required className="input-base" />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Endereço*
                </label>
                <input name="user_address" required className="input-base" />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-1/3">
                  <label className="block mb-1 text-sm font-medium">
                    Número*
                  </label>
                  <input name="user_number" required className="input-base" />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Complemento
                  </label>
                  <input name="user_complement" className="input-base" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Bairro*
                  </label>
                  <input
                    name="user_neighborhood"
                    required
                    className="input-base"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Cidade*
                  </label>
                  <input name="user_city" required className="input-base" />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Estado*
                </label>
                <select name="user_state" required className="input-base">
                  <option value="">Selecione</option>
                  {[
                    "AC",
                    "AL",
                    "AP",
                    "AM",
                    "BA",
                    "CE",
                    "DF",
                    "ES",
                    "GO",
                    "MA",
                    "MT",
                    "MS",
                    "MG",
                    "PA",
                    "PB",
                    "PR",
                    "PE",
                    "PI",
                    "RJ",
                    "RN",
                    "RS",
                    "RO",
                    "RR",
                    "SC",
                    "SP",
                    "SE",
                    "TO",
                  ].map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Termos */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="user_terms" required />
            Li e aceito os termos de uso e política de privacidade*
          </label>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="user_newsletter" />
            Desejo receber newsletters e comunicações
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg uppercase transition"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Enviando..." : "Enviar inscrição"}
        </button>
      </form>
    </main>
  );
}

