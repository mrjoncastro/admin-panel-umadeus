import Link from "next/link";

export default function ErroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-200 px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-6 border border-red-300">
        <h1 className="text-3xl font-extrabold text-red-700">
          ❌ Algo deu errado!
        </h1>

        <p className="text-gray-700 text-base leading-relaxed">
          Não conseguimos processar seu pagamento. Pode ter ocorrido um erro na
          finalização ou o pagamento foi recusado.
        </p>

        <div className="text-sm text-gray-500">
          Você pode tentar novamente ou entrar em contato com a organização.
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-block bg-purple-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
