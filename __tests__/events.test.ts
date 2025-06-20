import { describe, it, expect, vi } from 'vitest'
import type PocketBase from 'pocketbase'
import { atualizarStatus, type EventoRecord } from '../lib/events'

function criarEvento(
  id: string,
  dias: number,
  status: 'realizado' | 'em breve',
): EventoRecord {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  return {
    id,
    titulo: `Evento ${id}`,
    descricao: '',
    data: data.toISOString(),
    cidade: 'Salvador',
    status,
  }
}

describe('atualizarStatus', () => {
  it('atualiza apenas eventos passados nao realizados', async () => {
    const eventos: EventoRecord[] = [
      criarEvento('past', -1, 'em breve'),
      criarEvento('future', 1, 'em breve'),
      criarEvento('done', -2, 'realizado'),
    ]
    const update = vi.fn().mockResolvedValue({})
    const pb = { collection: () => ({ update }) } as unknown as PocketBase

    await atualizarStatus(eventos, pb)

    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith('past', { status: 'realizado' })
    expect(eventos.find((e) => e.id === 'past')?.status).toBe('realizado')
    expect(eventos.find((e) => e.id === 'future')?.status).toBe('em breve')
    expect(eventos.find((e) => e.id === 'done')?.status).toBe('realizado')
  })
})
