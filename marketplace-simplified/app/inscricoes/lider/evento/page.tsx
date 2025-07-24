import { EventForm } from '@/components/organisms'

function CadastroViaLider({
  searchParams,
}: {
  searchParams: { lider?: string; evento?: string }
}) {
  const { evento, lider } = searchParams

  return (
    <main className="px-4 py-10 flex justify-center">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Cadastro via Líder</h1>
        {evento && <EventForm eventoId={evento} liderId={lider} />}
      </div>
    </main>
  )
}

export default CadastroViaLider as unknown as (props: unknown) => JSX.Element
