import { describe, it, expect } from 'vitest'
import { POST } from '../../app/admin/api/pedidos/route'
import { NextRequest } from 'next/server'

describe('POST /admin/api/pedidos', () => {
  it('retorna 400 quando inscricaoId ausente', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })
})
