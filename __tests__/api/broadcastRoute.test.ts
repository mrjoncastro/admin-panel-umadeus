import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockRequireRole = vi.fn()
const mockAddMessages = vi.fn()
const mockGetProgress = vi.fn()

vi.mock('@/lib/pocketbase', () => ({
  __esModule: true,
  default: vi.fn(() => ({}))
}))

vi.mock('@/lib/apiAuth', () => ({
  requireRole: mockRequireRole
}))

vi.mock('@/lib/server/flows/whatsapp/broadcastManager', () => ({
  broadcastManager: {
    addMessages: mockAddMessages,
    getProgress: mockGetProgress,
    stopQueue: vi.fn()
  }
}))

describe('POST /api/chats/message/broadcast', () => {
  let pbMock: any
  let POST: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('../../app/api/chats/message/broadcast/route')
    POST = module.POST

    pbMock = {
      collection: vi.fn().mockReturnThis(),
      getOne: vi.fn(),
      getFirstListItem: vi.fn()
    }

    mockRequireRole.mockReturnValue({ pb: pbMock, user: { cliente: 'tenant1' } })
    mockGetProgress.mockReturnValue(null)
  })

  it('nega acesso quando usuario nao eh coordenador', async () => {
    mockRequireRole.mockReturnValueOnce({ error: 'Acesso negado', status: 403 })
    const req = new Request('http://test', { method: 'POST', body: '{}' })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(403)
  })

  it('retorna erro quando payload invalido', async () => {
    const req = new Request('http://test', { method: 'POST', body: '{}' })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })

  it('retorna erro quando config whatsapp ausente', async () => {
    pbMock.getOne.mockResolvedValueOnce({ id: '1', telefone: '1199', cliente: 'tenant1' })
    pbMock.getFirstListItem.mockRejectedValueOnce(new Error('not found'))
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ message: 'Oi', recipients: ['1'] })
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })

  it('adiciona mensagens na fila', async () => {
    pbMock.getOne
      .mockResolvedValueOnce({ id: '1', nome: 'A', telefone: '11999999999', cliente: 'tenant1' })
      .mockResolvedValueOnce({ id: '2', nome: 'B', telefone: '11988888888', cliente: 'tenant1' })
    pbMock.getFirstListItem.mockResolvedValueOnce({ instanceName: 'inst', apiKey: 'k' })
    mockAddMessages.mockResolvedValue({ success: true, message: 'ok', queueId: 'tenant1' })

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ message: 'Oi', recipients: ['1', '2'] })
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.queueId).toBe('tenant1')
    expect(mockAddMessages).toHaveBeenCalled()
  })
})
