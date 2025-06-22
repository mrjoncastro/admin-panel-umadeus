'use client'
import { EventForm } from '@/components/organisms'

export default function CadastroViaLider({
  searchParams,
}: {
  searchParams: { lider?: string; evento?: string }
}) {
  return (
    <main className="px-4 py-10 flex justify-center">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Cadastro via Líder</h1>
        {searchParams.evento && (
          <EventForm eventoId={searchParams.evento} liderId={searchParams.lider} />
        )}
      </div>
    </main>
  )
}
