// lib/hooks/useAuth

'use client'

import { useState, useEffect } from 'react'
import type { UserModel } from '@/types/UserModel'

export function useAuth() {
  const [user, setUser] = useState<UserModel | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user as UserModel)
          setIsLoggedIn(true)
        } else {
          setUser(null)
          setIsLoggedIn(false)
        }
      } catch {
        setUser(null)
        setIsLoggedIn(false)
      }
    }

    load()
  }, [])

  return {
    user,
    isLoggedIn,
  }
}
