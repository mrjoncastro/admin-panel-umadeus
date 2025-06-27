import type PocketBase from 'pocketbase'

export function getAuthHeaders(pb: PocketBase) {
  pb.authStore.loadFromCookie(document.cookie)
  return {
    Authorization: `Bearer ${pb.authStore.token}`,
    'X-PB-User': JSON.stringify(pb.authStore.model),
  }
}
