'use client'
import { useEffect } from 'react'

export function useSyncTenant() {
  useEffect(() => {
    fetch('/api/tenant', { credentials: 'include' }).catch(() => {})
  }, [])
}
