import { PaymentMethod } from './asaasFees'

export function toAsaasBilling(method: PaymentMethod): string {
  switch (method) {
    case 'pix':
      return 'PIX'
    case 'boleto':
      return 'BOLETO'
    default:
      return 'UNDEFINED'
  }
}
