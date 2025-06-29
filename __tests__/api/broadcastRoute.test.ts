import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock das dependências
const mockSendTextMessage = vi.fn()
const mockRequireRole = vi.fn()

vi.mock('@/lib/pocketbase', () => ({
  __esModule: true,
  default: vi.fn(() => ({})),
}))

vi.mock('@/lib/server/chats', () => ({
  sendTextMessage: mockSendTextMessage,
}))

vi.mock('@/lib/apiAuth', () => ({
  requireRole: mockRequireRole,
}))

describe('POST /api/chats/message/broadcast', () => {
  let pbMock: any
  let POST: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Importa a função POST dinamicamente
    const module = await import('../../app/api/chats/message/broadcast/route')
    POST = module.POST
    
    pbMock = {
      collection: vi.fn().mockReturnThis(),
      getOne: vi.fn(),
      getFirstListItem: vi.fn(),
    }
    mockRequireRole.mockImplementation(() => ({ pb: pbMock, user: { cliente: 'tenant1' } }))
  })

  it('deve negar acesso se não for coordenador', async () => {
    mockRequireRole.mockReturnValueOnce({ error: 'Acesso negado', status: 403 })
    const req = new Request('http://test', { method: 'POST', body: '{}' })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.errors[0]).toMatch(/Acesso negado/)
  })

  it('deve retornar erro se payload faltar campos', async () => {
    const req = new Request('http://test', { method: 'POST', body: '{}' })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.errors[0]).toMatch(/Parâmetros faltando/)
  })

  it('deve retornar erro se não houver configuração WhatsApp', async () => {
    pbMock.getOne.mockResolvedValueOnce({
      id: '1',
      nome: 'Fulano',
      telefone: '11999999999',
      cliente: 'tenant1',
    })
    pbMock.getFirstListItem.mockRejectedValueOnce(new Error('not found'))
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ message: 'Oi', recipients: ['1'] }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.errors[0]).toMatch(/Configuração WhatsApp/)
  })

  it('deve enviar mensagem para os destinatários informados', async () => {
    pbMock.getOne
      .mockResolvedValueOnce({ id: '1', nome: 'Fulano', telefone: '11999999999', cliente: 'tenant1' })
      .mockResolvedValueOnce({ id: '2', nome: 'Beltrano', telefone: '11988888888', cliente: 'tenant1' })
    pbMock.getFirstListItem.mockResolvedValueOnce({ instanceName: 'inst1', apiKey: 'key1' })
    mockSendTextMessage.mockResolvedValue({ ok: true })
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ message: 'Oi', recipients: ['1', '2'] }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(2)
    expect(data.failed).toBe(0)
    expect(data.errors.length).toBe(0)
    expect(mockSendTextMessage).toHaveBeenCalledTimes(2)
  })

  it('deve contabilizar falhas individuais', async () => {
    pbMock.getOne
      .mockResolvedValueOnce({ id: '1', nome: 'Fulano', telefone: '11999999999', cliente: 'tenant1' })
      .mockResolvedValueOnce({ id: '2', nome: 'Beltrano', telefone: '11988888888', cliente: 'tenant1' })
    pbMock.getFirstListItem.mockResolvedValueOnce({ instanceName: 'inst1', apiKey: 'key1' })
    mockSendTextMessage
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce(new Error('Falha ao enviar'))
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ message: 'Oi', recipients: ['1', '2'] }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(1)
    expect(data.failed).toBe(1)
    expect(data.errors.length).toBe(1)
    expect(data.errors[0]).toMatch(/Beltrano/)
  })


  it('deve ignorar usuários sem telefone válido', async () => {
    pbMock.getOne
      .mockResolvedValueOnce({ id: '1', nome: 'Fulano', telefone: '11999999999', cliente: 'tenant1' })
      .mockResolvedValueOnce({ id: '2', nome: 'Beltrano', telefone: '', cliente: 'tenant1' })
      .mockResolvedValueOnce({ id: '3', nome: 'Ciclano', telefone: null, cliente: 'tenant1' })
    pbMock.getFirstListItem.mockResolvedValueOnce({ instanceName: 'inst1', apiKey: 'key1' })
    mockSendTextMessage.mockResolvedValue({ ok: true })
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ message: 'Oi', recipients: ['1', '2', '3'] }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(1)
    expect(data.failed).toBe(2)
    expect(data.errors.length).toBe(2)
    expect(mockSendTextMessage).toHaveBeenCalledTimes(1)
  })
}) 