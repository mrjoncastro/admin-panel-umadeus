import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../app/api/email/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const pb = createPocketBaseMock()
const cfgMock = {
  smtpHost: 'h',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: 'u',
  smtpPass: 'p',
  smtpFrom: 'from@test.com',
  cor_primary: '#000',
  logo_url: 'logo.png',
  nome: 'Test Tenant',
}
const userGetMock = vi.fn()
const configGetMock = vi.fn()

vi.mock('../../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))
const getTenantMock = vi.fn().mockResolvedValue('t1')
vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: (...a: any[]) => getTenantMock(...a),
}))

const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'm1' })
const verifyMock = vi.fn().mockResolvedValue(true)
vi.mock('nodemailer', () => ({
  default: { 
    createTransport: vi.fn(() => ({ 
      sendMail: sendMailMock,
      verify: verifyMock
    })) 
  },
}))

beforeEach(() => {
  userGetMock.mockReset()
  configGetMock.mockReset()
  sendMailMock.mockClear()
  verifyMock.mockClear()
  getTenantMock.mockResolvedValue('t1')
  
  // Mock padrão para configuração
  configGetMock.mockResolvedValue(cfgMock)
  
  // Mock padrão para autenticação admin
  pb.authStore.isValid = false
  pb.admins.authWithPassword.mockResolvedValue({})
  
  // Mock das collections
  pb.collection.mockImplementation((name: string) => {
    if (name === 'clientes_config') {
      return { getFirstListItem: configGetMock }
    }
    if (name === 'usuarios') {
      return { getOne: userGetMock }
    }
    return {
      create: vi.fn(),
      update: vi.fn(),
      getFullList: vi.fn(),
      getList: vi.fn(),
      getOne: vi.fn(),
      getFirstListItem: vi.fn(),
    }
  })
})

describe('POST /api/email', () => {
  it('retorna 400 se faltar parametros', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando usuario sem email', async () => {
    userGetMock.mockResolvedValueOnce({ id: 'u1', email: '' })
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ eventType: 'nova_inscricao', userId: 'u1' }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })

  it('envia email com sucesso', async () => {
    userGetMock.mockResolvedValueOnce({
      id: 'u1',
      email: 'e@test.com',
      nome: 'Nome',
    })
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        eventType: 'confirmacao_inscricao',
        userId: 'u1',
        paymentLink: 'http://pay',
      }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(sendMailMock).toHaveBeenCalled()
    const body = await res.json()
    expect(body.message).toBe('E-mail enviado com sucesso')
  })
})
