// Página pública - informa que o pagamento está em análise
import Link from 'next/link'

export default function PagamentoPendentePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-yellow-200 px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-6 border border-yellow-300">
        <h1 className="text-3xl font-extrabold text-yellow-700">
          ⏳ Pagamento em análise
        </h1>

        <p className="text-gray-700 text-base leading-relaxed">
          Recebemos sua solicitação de inscrição, e o pagamento está em processo
          de confirmação. Assim que for aprovado, você receberá um e-mail de
          confirmação.
        </p>

        <div className="text-sm text-gray-500">
          Isso pode levar alguns minutos, dependendo da forma de pagamento
          escolhida.
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block bg-purple-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Voltar para o início
          </Link>
        </div>

        <p className="text-xs text-gray-400 italic mt-6">
          #UMADEUS2025 — Permanecendo firmes na fé ✨
        </p>
      </div>
    </div>
  )
}
