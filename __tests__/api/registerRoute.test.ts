import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../app/api/register/route'
import { NextRequest } from 'next/server'

const getOneMock = vi.fn().mockRejectedValue(new Error('not found'))
const createMock = vi.fn()

vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => ({
    collection: () => ({ getOne: getOneMock, create: createMock })
  }))
}))

describe('POST /api/register', () => {
  it('retorna 404 se cliente nao encontrado', async () => {
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ nome:'n', email:'e', telefone:'t', password:'p', cliente:'1' }) })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Cliente não encontrado')
  })
})
