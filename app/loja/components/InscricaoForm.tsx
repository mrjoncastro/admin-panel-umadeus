"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import Spinner from "@/components/Spinner";


const CEP_BASE_URL =
  process.env.NEXT_PUBLIC_VIA_CEP_URL || process.env.NEXT_PUBLIC_BRASILAPI_URL || "";

interface Campo {
  id: string;
  nome: string;
}

interface InscricaoFormProps {
  eventoId: string;
}

export default function InscricaoForm({ eventoId }: InscricaoFormProps) {
  const { user } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const firstName = user?.nome?.split(" ")[0] || "";
  const lastName = user?.nome?.split(" ").slice(1).join(" ") || "";
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [campos, setCampos] = useState<Campo[]>([]);
  const [cep, setCep] = useState(String(user?.cep ?? ""));
  const [endereco, setEndereco] = useState(String(user?.endereco ?? ""));
  const [cidade, setCidade] = useState(String(user?.cidade ?? ""));
  const [estado, setEstado] = useState(String(user?.estado ?? ""));
  const [bairro, setBairro] = useState(String(user?.bairro ?? ""));
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("/api/campos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => (Array.isArray(data) ? setCampos(data) : setCampos([])))
      .catch((err) => console.error("Erro ao carregar campos:", err));
  }, []);

  useEffect(() => {
    if (!user || !formRef.current) return;
    const form = formRef.current;
    const setVal = (name: string, value: string) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      if (el && !el.value) {
        el.value = value;
      }
    };
    setVal("user_first_name", firstName);
    setVal("user_last_name", lastName);
    setVal("user_email", String(user.email ?? ""));
    setVal("user_phone", String(user.telefone ?? ""));
    setVal("user_cpf", String(user.cpf ?? ""));
    setVal("user_birth_date", String(user.data_nascimento ?? ""));
    setCep(String(user.cep ?? ""));
    setEndereco(String(user.endereco ?? ""));
    setCidade(String(user.cidade ?? ""));
    setEstado(String(user.estado ?? ""));
    setBairro(String(user.bairro ?? ""));
    setVal("user_number", String(user.numero ?? ""));
    setVal("user_complement", String(user.complemento ?? ""));
    setVal("user_neighborhood", String(user.bairro ?? ""));
  }, [user, firstName, lastName]);

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8 || !CEP_BASE_URL) return;
    const url = process.env.NEXT_PUBLIC_VIA_CEP_URL
      ? `${CEP_BASE_URL}/${cleanCep}/json/`
      : `${CEP_BASE_URL}/cep/v1/${cleanCep}`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("CEP not found");
        }
        return res.json();
      })
      .then((data) => {
        setEndereco(data.logradouro || data.street || "");
        setCidade(data.localidade || data.city || "");
        setEstado(data.uf || data.state || "");
        setBairro(data.bairro || data.neighborhood || "");
      })
      .catch(() => console.warn("Erro ao buscar o CEP"));
  }, [cep]);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("/loja/api/inscricoes", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar inscrição");
      }

      setStatus("success");
      showSuccess("Inscrição registrada! Em breve entraremos em contato.");
      router.push("/loja/inscricoes/confirmacao");
    } catch (err) {
      console.warn("Erro ao enviar inscrição:", err);
      setStatus("error");
      showError("Erro ao enviar a inscrição. Tente novamente.");
    }
  };

  return (
    <main className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8 my-10 font-sans text-gray-800">

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
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
                    defaultValue={firstName}
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
                    defaultValue={lastName}
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
                    defaultValue={String(user?.email ?? "")}
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
                    defaultValue={String(user?.telefone ?? "")}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">CPF*</label>
                  <input
                    name="user_cpf"
                    required
                    className="input-base"
                    defaultValue={String(user?.cpf ?? "")}
                  />
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
                    defaultValue={String(user?.data_nascimento ?? "")}
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
                <input
                  name="user_cep"
                  required
                  className="input-base"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Endereço*
                </label>
                <input
                  name="user_address"
                  required
                  className="input-base"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-1/3">
                  <label className="block mb-1 text-sm font-medium">
                    Número*
                  </label>
                  <input
                    name="user_number"
                    required
                    className="input-base"
                    defaultValue={String(user?.numero ?? "")}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Complemento
                  </label>
                  <input
                    name="user_complement"
                    className="input-base"
                    defaultValue={String(user?.complemento ?? "")}
                  />
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
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Cidade*
                  </label>
                  <input
                    name="user_city"
                    required
                    className="input-base"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Estado*
                </label>
                <select
                  name="user_state"
                  required
                  className="input-base"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
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
          {status === "sending" ? (
            <Spinner className="w-4 h-4" />
          ) : (
            "Enviar inscrição"
          )}
        </button>
      </form>
    </main>
  );
}

