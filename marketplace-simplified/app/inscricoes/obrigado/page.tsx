import Link from 'next/link'

export default function ObrigadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-purple-200 px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-6 border border-purple-300">
        <h1 className="text-3xl font-extrabold text-purple-700">
          🎉 Inscrição Confirmada!
        </h1>

        <p className="text-gray-700 text-base leading-relaxed">
          Sua inscrição foi enviada com sucesso e será analisada pela liderança.
          Após a aprovação, você receberá em seu e-mail as instruções para
          realizar o pagamento e confirmar sua participação.
        </p>

        <div className="text-sm text-gray-500">
          Confira seu e-mail para mais detalhes.
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
          #UMADEUS2025 — Juntos na missão 💜
        </p>
      </div>
    </div>
  )
}
