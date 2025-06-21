import PocketBase from 'pocketbase'

const PB_URL = process.env.NEXT_PUBLIC_PB_URL!
const basePb = new PocketBase(PB_URL)

export function createPocketBase() {
  const pbWithClone = basePb as PocketBase & { clone?: () => PocketBase }
  const pb =
    typeof pbWithClone.clone === 'function'
      ? pbWithClone.clone()
      : new PocketBase(PB_URL)

  pb.authStore.save(basePb.authStore.token, basePb.authStore.model)
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
