import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../app/api/asaas/webhook/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const pb = createPocketBaseMock()
const createTask = vi.fn()

pb.collection.mockImplementation((name: string) => {
  if (name === 'webhook_tasks') return { create: createTask }
  return {}
})

vi.mock('../../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))

beforeEach(() => {
  vi.clearAllMocks()
  createTask.mockResolvedValue({ id: 't1' })
})

describe('POST /api/asaas/webhook', () => {
  it('retorna 400 com JSON invalido', async () => {
    const req = new Request('http://test/api/asaas/webhook', { method: 'POST' })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })

  it('cria task e retorna 200', async () => {
    const payload = { event: 'PAYMENT_RECEIVED', payment: { id: 'p1' } }
    const req = new Request('http://test/api/asaas/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(createTask).toHaveBeenCalledWith({
      event: 'PAYMENT_RECEIVED',
      payload,
      status: 'pending',
      attempts: 0,
      max_attempts: 3,
    })
  })
})
