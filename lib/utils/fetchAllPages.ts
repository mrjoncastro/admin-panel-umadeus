export async function fetchAllPages<T = unknown>(
  url: string,
  totalPages: number,
  signal?: AbortSignal,
): Promise<T[]> {
  if (totalPages <= 1) return []

  const parsed = new URL(url, 'http://localhost')
  const basePath = parsed.pathname
  const params = parsed.searchParams

  const promises: Promise<T>[] = []
  for (let page = 2; page <= totalPages; page++) {
    params.set('page', String(page))
    const fullUrl = `${basePath}?${params.toString()}`
    promises.push(
      fetch(fullUrl, { credentials: 'include', signal }).then((r) => r.json()),
    )
  }

  return Promise.all(promises)
}
