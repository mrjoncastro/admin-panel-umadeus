// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

export interface EventoRecord {
  id: string
  titulo: string
  descricao: string
  data: string
  cidade: string
  imagem?: string
  logo?: string
  status: 'realizado' | 'em breve'
  [key: string]: unknown
}

// [REMOVED] PocketBase import

export function atualizarStatus(
  eventos: EventoRecord[],
  pb: PocketBase,
): Promise<void[]> {
  const agora = new Date()
  const atualizacoes: Promise<void>[] = []

  eventos.forEach((e) => {
    const dataEvento = new Date(e.data)
    if (
      e.status !== 'realizado' &&
      !isNaN(dataEvento.getTime()) &&
      dataEvento < agora
    ) {
      e.status = 'realizado'
      atualizacoes.push(
        pb
          .collection('eventos')
          .update(e.id, { status: 'realizado' })
          .then(() => {}),
      )
    }
  })

  return Promise.all(atualizacoes)
}
