// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// [REMOVED] PocketBase import

export function getAuthHeaders(pb: PocketBase): HeadersInit {
  if (// pb. // [REMOVED] authStore.isValid && // pb. // [REMOVED] authStore.token && // pb. // [REMOVED] authStore.model) {
    return {
      Authorization: `Bearer ${// pb. // [REMOVED] authStore.token}`,
      'X-PB-User': JSON.stringify(// pb. // [REMOVED] authStore.model),
    }
  }
  return {}
}
