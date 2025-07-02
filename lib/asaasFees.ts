export type PaymentMethod = 'pix' | 'boleto' | 'credito'

interface FeeRange {
  min: number
  max: number
  fixed: number
  percent: number
}

const feeTable: Record<PaymentMethod, FeeRange[]> = {
  pix: [{ min: 1, max: 1, fixed: 1.99, percent: 0 }],
  boleto: [{ min: 1, max: 1, fixed: 1.99, percent: 0 }],
  credito: [
    { min: 1, max: 1, fixed: 0.49, percent: 0.0299 },
    { min: 2, max: 6, fixed: 0.49, percent: 0.0349 },
    { min: 7, max: 12, fixed: 0.49, percent: 0.0399 },
    { min: 13, max: 21, fixed: 0.49, percent: 0.0429 },
  ],
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
  let gross = Number(((V + margin + F) / (1 - P)).toFixed(2))

  if (payment === 'credito') {
    const pixGross = calculateGross(V, 'pix', 1).gross
    if (gross < pixGross) {
      gross = pixGross
    }
  }

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
