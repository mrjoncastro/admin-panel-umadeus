export interface CepData {
  street: string
  neighborhood: string
  city: string
  state: string
}

/**
 * Fetch address data from ViaCEP with fallback to BrasilAPI.
 */
export async function fetchCep(
  cep: string,
  fetchFn: typeof fetch = fetch,
): Promise<CepData | null> {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null

  const viaCepBase =
    process.env.NEXT_PUBLIC_VIA_CEP_URL || 'https://viacep.com.br/ws'
  const brasilApiBase =
    process.env.NEXT_PUBLIC_BRASILAPI_URL || 'https://brasilapi.com.br/api'

  try {
    const viaCepRes = await fetchFn(`${viaCepBase}/${clean}/json/`)
    if (viaCepRes.ok) {
      const d = await viaCepRes.json()
      if (!d.erro) {
        return {
          street: d.logradouro || '',
          neighborhood: d.bairro || '',
          city: d.localidade || '',
          state: d.uf || '',
        }
      }
    }
  } catch {
    // ignore and fallback
  }

  try {
    const brasilRes = await fetchFn(`${brasilApiBase}/cep/v1/${clean}`)
    if (brasilRes.ok) {
      const d = await brasilRes.json()
      return {
        street: d.street || '',
        neighborhood: d.neighborhood || '',
        city: d.city || '',
        state: d.state || '',
      }
    }
  } catch {
    // ignore
  }

  return null
}
