"use client";

import { useRouter } from "next/navigation";

export default function MiniPrecosPost() {
  const router = useRouter();

  return (
    <section id="planos" className="bg-blue-50 rounded-2xl border border-blue-100 p-8 mt-16 max-w-5xl mx-auto text-gray-900 shadow-sm">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
        Cuidado que chega na hora certa
      </h2>
      <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto text-base md:text-lg">
        Por menos de R$1,50 por dia, você tem acesso imediato e sem burocracia a
        profissionais que cuidam de verdade de você e da sua família — onde
        estiver, quando precisar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Individual */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow hover:shadow-md transition flex flex-col justify-between h-full">
          <div>
            <h3 className="text-lg font-semibold text-center mb-2">
              Individual Premium+
            </h3>
            <p className="text-3xl font-bold text-center mb-3 text-blue-700">
              R$39,90 <span className="text-base font-normal">/mês</span>
            </p>
            <ul className="text-sm text-gray-700 space-y-1 text-center mb-4">
              <li>Atendimento clínico 24h</li>
              <li>Mais de 20 especialidades disponíveis</li>
              <li>Receitas e atestados digitais com validade jurídica</li>
              <li>Sem carência, com acesso imediato</li>
              <li>App disponível 24h</li>
            </ul>
          </div>
          <button
            onClick={() => router.push("/checkout/individual")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition cursor-pointer"
          >
            ASSINAR INDIVIDUAL
          </button>
        </div>

        {/* Familiar */}
        <div className="bg-white rounded-xl border-2 border-blue-600 p-6 shadow-lg hover:shadow-xl transition relative flex flex-col justify-between h-full">
          <div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-800 text-xs px-3 py-1 rounded-full font-bold shadow">
              MAIS ESCOLHIDO
            </div>
            <h3 className="text-lg font-semibold text-center mt-3 mb-2">
              Family Premium+
            </h3>
            <p className="text-3xl font-bold text-center mb-3 text-blue-700">
              R$69,90 <span className="text-base font-normal">/mês</span>
            </p>
            <ul className="text-sm text-gray-700 space-y-1 text-center mb-4">
              <li>Tudo do plano Individual</li>
              <li>Cobertura para você + 4 dependentes</li>
              <li>App disponível 24h</li>
              <li>Receitas e atestados digitais com validade jurídica</li>
              <li>Sem carência, com acesso imediato</li>
            </ul>
          </div>
          <button
            onClick={() => router.push("/checkout/family")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition cursor-pointer"
          >
            ASSINAR FAMILIAR
          </button>
        </div>
      </div>
    </section>
  );
}
