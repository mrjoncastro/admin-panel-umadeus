const requests = new Map<string, { count: number; first: number }>()

export function rateLimit(key: string, windowMs = 60_000, max = 5) {
  const now = Date.now()
  const entry = requests.get(key)
  if (!entry || now - entry.first > windowMs) {
    requests.set(key, { count: 1, first: now })
    return false
  }
  entry.count += 1
  if (entry.count > max) return true
  return false
}
