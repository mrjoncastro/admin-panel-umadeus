import { describe, it, expect } from 'vitest'
import { GET } from '../../app/api/checkout-link/route'

describe('GET /api/checkout-link', () => {
  it('retorna 500 quando variavel de ambiente ausente', async () => {
    delete process.env.CAMISETA_CHECKOUT_URL
    const res = await GET()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Checkout URL not configured')
  })
})
