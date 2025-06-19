import { describe, it, expect } from 'vitest'
import { toAsaasBilling } from '../lib/paymentMethodMap'

describe('toAsaasBilling', () => {
  it('converte formas de pagamento', () => {
    expect(toAsaasBilling('pix')).toBe('PIX')
    expect(toAsaasBilling('boleto')).toBe('BOLETO')
    expect(toAsaasBilling('credito')).toBe('CREDIT_CARD')
  })
})
