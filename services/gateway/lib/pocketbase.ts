import PocketBase from 'pocketbase'

const DEFAULT_PB_URL = 'http://127.0.0.1:8090'

const PB_URL = process.env.PB_URL || DEFAULT_PB_URL

if (!process.env.PB_URL) {
  console.warn(`PB_URL não configurada. Usando valor padrão: ${DEFAULT_PB_URL}`)
}

const basePb = new PocketBase(PB_URL)

export function createPocketBase(copyAuth = true) {
  const pbWithClone = basePb as PocketBase & { clone?: () => PocketBase }
  const pb =
    typeof pbWithClone.clone === 'function'
      ? pbWithClone.clone()
      : new PocketBase(PB_URL)
  if (copyAuth) {
    pb.authStore.save(basePb.authStore.token, basePb.authStore.model)
  } else {
    pb.authStore.clear()
  }
  pb.beforeSend = (url, opt) => {
    opt.credentials = 'include'
    return { url, options: opt }
  }
  pb.autoCancellation(false)
  return pb
}

export function updateBaseAuth(
  token: string,
  model: Parameters<typeof basePb.authStore.save>[1],
) {
  basePb.authStore.save(token, model)
}

export function clearBaseAuth() {
  basePb.authStore.clear()
}

export default createPocketBase
