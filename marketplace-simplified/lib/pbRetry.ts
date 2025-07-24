import pRetry, { AbortError } from 'p-retry'

function isNetworkError(err: unknown) {
  const message = (err as { message?: string })?.message || String(err)
  return (
    message.includes('ECONNRESET') ||
    message.includes('fetch failed') ||
    (err as { status?: number })?.status === 0
  )
}

export async function pbRetry<T>(fn: () => Promise<T>) {
  return pRetry(
    async () => {
      try {
        return await fn()
      } catch (err) {
        if (isNetworkError(err)) {
          throw err
        }
        throw new AbortError(err as Error)
      }
    },
    { retries: 3 },
  )
}
