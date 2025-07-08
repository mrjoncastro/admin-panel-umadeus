import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-6 border border-gray-300">
        <h1 className="text-3xl font-extrabold text-gray-700">
          Página não encontrada
        </h1>
        <p className="text-gray-700 text-base leading-relaxed">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="pt-4">
          <Link
            href="/admin"
            className="inline-block bg-purple-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Voltar para o início do admin
          </Link>
        </div>
      </div>
    </div>
  )
}
