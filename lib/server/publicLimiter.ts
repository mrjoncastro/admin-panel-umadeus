import rateLimit from 'next-rate-limit'

export const publicLimiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
})
