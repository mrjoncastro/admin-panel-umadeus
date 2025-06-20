import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SucessoConfirmacaoPage({
  searchParams,
}: {
  searchParams: any
}) {
  const params = searchParams as Record<string, string | undefined>
  const mensagem = params.mensagem
  const acaoPrimaria =
    params.acaoPrimariaLabel && params.acaoPrimariaHref
      ? {
          label: params.acaoPrimariaLabel as string,
          href: params.acaoPrimariaHref as string,
        }
      : undefined
  const acaoSecundaria =
    params.acaoSecundariaLabel && params.acaoSecundariaHref
      ? {
          label: params.acaoSecundariaLabel as string,
          href: params.acaoSecundariaHref as string,
        }
      : undefined
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="mb-4 animate-bounce">
          <CheckCircle className="text-green-600" size={56} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tudo certo!</h1>
        <div className="text-gray-600 text-base mb-2">
          {mensagem || 'Sua ação foi realizada com sucesso.'}
        </div>
        <div className="text-gray-500 text-xs mb-6">
          Você receberá mais informações em breve por e-mail ou mensagem.
        </div>
        <div className="flex flex-col gap-3 w-full">
          {acaoPrimaria && (
            <Link
              href={acaoPrimaria.href}
              className="w-full inline-flex justify-center items-center px-4 py-3 rounded-xl bg-green-600 text-white text-base font-medium hover:bg-green-700 transition"
            >
              {acaoPrimaria.label}
            </Link>
          )}
          {acaoSecundaria && (
            <Link
              href={acaoSecundaria.href}
              className="w-full inline-flex justify-center items-center px-4 py-3 rounded-xl border border-gray-300 text-gray-700 text-base font-medium bg-white hover:bg-gray-100 transition"
            >
              {acaoSecundaria.label}
            </Link>
          )}
        </div>
        <div className="mt-8 text-xs text-gray-400 text-center">
          Precisa de ajuda?{' '}
          <a href="/suporte" className="underline hover:text-black">
            Fale conosco
          </a>
        </div>
      </div>
    </div>
  )
}
