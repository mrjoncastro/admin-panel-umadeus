import { PaymentMethod } from './asaasFees'

export function toAsaasBilling(method: PaymentMethod): string {
  switch (method) {
    case 'pix':
      return 'PIX'
    case 'boleto':
      return 'BOLETO'
    case 'credito':
      return 'CREDIT_CARD'
    default:
      return 'UNDEFINED'
  }
}
