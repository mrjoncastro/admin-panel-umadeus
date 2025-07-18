export type PaymentMethod = 'pix' | 'boleto'

interface FeeRange {
  min: number
  max: number
  fixed: number
  percent: number
}

const feeTable: Record<PaymentMethod, FeeRange[]> = {
  pix: [{ min: 1, max: 1, fixed: 1.99, percent: 0 }],
  boleto: [{ min: 1, max: 1, fixed: 1.99, percent: 0 }],
}

export function getAsaasFees(payment: PaymentMethod, installments = 1) {
  const ranges = feeTable[payment]
  for (const r of ranges) {
    if (installments >= r.min && installments <= r.max) {
      return { fixedFee: r.fixed, percentFee: r.percent }
    }
  }
  // fallback to last range
  const last = ranges[ranges.length - 1]
  return { fixedFee: last.fixed, percentFee: last.percent }
}

export function calculateGross(
  V: number,
  payment: PaymentMethod,
  installments: number,
): { gross: number; margin: number } {
  const margin = Number((V * 0.07).toFixed(2))
  const { fixedFee: F, percentFee: P } = getAsaasFees(payment, installments)
  const gross = Number(((V + margin + F) / (1 - P)).toFixed(2))

  return { gross, margin }
}

export function calculateNet(
  G: number,
  payment: PaymentMethod,
  installments: number,
): { net: number; margin: number } {
  const { fixedFee: F, percentFee: P } = getAsaasFees(payment, installments)
  const net = Number(((G * (1 - P) - F) / 1.07).toFixed(2))
  const margin = Number((net * 0.07).toFixed(2))
  return { net, margin }
}
