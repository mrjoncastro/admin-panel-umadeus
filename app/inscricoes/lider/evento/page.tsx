import { headers } from 'next/headers'
import { ConsultaInscricao } from '@/components/organisms'
import type { Evento } from '@/types'

export default async function CadastroViaLider({
  searchParams,
}: {
  searchParams: Promise<{ lider?: string; evento?: string }>
}) {
  const { evento, lider } = await searchParams
  let eventoAberto = true
  if (evento) {
    try {
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
      const h = await headers()
      const host = h.get('host')
      if (host) {
        const res = await fetch(`${protocol}://${host}/api/eventos/${evento}`, {
          cache: 'no-store',
        })
        if (res.ok) {
          const data = (await res.json()) as Evento
          eventoAberto = data.status !== 'realizado'
        }
      }
    } catch {
      eventoAberto = true
    }
  }

  return (
    <main className="px-4 py-10 flex justify-center">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Cadastro via Líder</h1>
        {evento && (
          <ConsultaInscricao
            eventoId={evento}
            liderId={lider}
            eventoAberto={eventoAberto}
          />
        )}
      </div>
    </main>
  )
}
