'use client'
import { useEffect, useMemo } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'

export function useSyncTenant() {
  const pb = useMemo(() => createPocketBase(), [])
  useEffect(() => {
    const headers = getAuthHeaders(pb)
    fetch('/api/tenant', { headers, credentials: 'include' }).catch(() => {})
  }, [pb])
}
