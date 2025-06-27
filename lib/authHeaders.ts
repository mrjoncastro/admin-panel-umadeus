import type PocketBase from 'pocketbase'

export function getAuthHeaders(pb: PocketBase) {
  if (pb.authStore.isValid && pb.authStore.token && pb.authStore.model) {
    return {
      Authorization: `Bearer ${pb.authStore.token}`,
      'X-PB-User': JSON.stringify(pb.authStore.model),
    }
  }
  return {}
}
