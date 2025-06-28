import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/usuarios/password-reset/route'
import { NextRequest } from 'next/server'

// Mock das dependências
vi.mock('@/lib/server/flows/usuarios/requestPasswordResetManual', () => ({
  requestPasswordResetManual: vi.fn()
}))

vi.mock('@/lib/getTenantFromHost', () => ({
  getTenantFromHost: vi.fn()
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({
    get: vi.fn((key: string) => {
      if (key === 'host') return 'teste.localhost:3000'
      return null
    })
  }))
}))

describe('POST /api/usuarios/password-reset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar erro quando email não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/usuarios/password-reset', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email é obrigatório')
  })

  it('deve retornar erro quando formato de email é inválido', async () => {
    const request = new NextRequest('http://localhost:3000/api/usuarios/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email: 'email-invalido' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Formato de email inválido')
  })

  it('deve retornar sucesso quando email é válido', async () => {
    const { requestPasswordResetManual } = await import('@/lib/server/flows/usuarios/requestPasswordResetManual')
    
    vi.mocked(requestPasswordResetManual).mockResolvedValue({
      success: true,
      message: 'E-mail de recuperação enviado com sucesso'
    })

    const request = new NextRequest('http://localhost:3000/api/usuarios/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email: 'teste@exemplo.com' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('E-mail de recuperação enviado com sucesso')
    expect(requestPasswordResetManual).toHaveBeenCalledWith('teste@exemplo.com')
  })

  it('deve retornar erro quando a função falha', async () => {
    const { requestPasswordResetManual } = await import('@/lib/server/flows/usuarios/requestPasswordResetManual')
    
    vi.mocked(requestPasswordResetManual).mockResolvedValue({
      success: false,
      message: 'Usuário não encontrado'
    })

    const request = new NextRequest('http://localhost:3000/api/usuarios/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email: 'teste@exemplo.com' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Usuário não encontrado')
  })

  it('deve retornar erro 500 quando ocorre exceção', async () => {
    const { requestPasswordResetManual } = await import('@/lib/server/flows/usuarios/requestPasswordResetManual')
    
    vi.mocked(requestPasswordResetManual).mockRejectedValue(new Error('Erro interno'))

    const request = new NextRequest('http://localhost:3000/api/usuarios/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email: 'teste@exemplo.com' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Erro interno do servidor')
  })
}) 