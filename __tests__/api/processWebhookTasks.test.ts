import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../../app/api/cron/process-webhook-tasks'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const pb = createPocketBaseMock()
const getFullList = vi.fn()
const update = vi.fn()

pb.collection.mockImplementation((name: string) => {
  if (name === 'webhook_tasks') return { getFullList, update }
  return {}
})

vi.mock('../../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))

beforeEach(() => {
  vi.clearAllMocks()
  getFullList.mockResolvedValue([
    {
      id: 't1',
      event: 'PAYMENT_RECEIVED',
      payload: {},
      status: 'pending',
      attempts: 0,
      max_attempts: 1,
      next_retry: null,
    },
  ])
  update.mockResolvedValue({})
})

describe('GET /api/cron/process-webhook-tasks', () => {
  it('processa tasks pendentes', async () => {
    const req = new Request('http://test/api/cron/process-webhook-tasks')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(getFullList).toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith('t1', { status: 'processing' })
    expect(update).toHaveBeenCalledWith('t1', { status: 'done', error: '' })
  })
})
