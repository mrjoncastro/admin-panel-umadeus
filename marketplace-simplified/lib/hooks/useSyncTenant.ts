// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

'use client'
import { useEffect, useMemo } from 'react'
// [REMOVED] PocketBase import
import { getAuthHeaders } from '@/lib/authHeaders'

export function useSyncTenant() {
  // const pb = useMemo(() => createPocketBase(), []) // [REMOVED]
  useEffect(() => {
    const headers = getAuthHeaders(pb)
    fetch('/api/tenant', { headers, credentials: 'include' }).catch(() => {})
  }, [pb])
}
