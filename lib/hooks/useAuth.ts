// lib/hooks/useAuth

'use client'

import { useState, useEffect, useMemo } from 'react'
import createPocketBase from '@/lib/pocketbase'
import type { UserModel } from '@/types/UserModel'

export function useAuth() {
  const pb = useMemo(() => createPocketBase(), [])
  const [user, setUser] = useState<UserModel | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const update = () => {
      const isValid = pb.authStore.isValid
      const model = pb.authStore.model as unknown as UserModel | null
      const tokenAtual = pb.authStore.token

      setUser(model)
      setToken(tokenAtual)
      setIsLoggedIn(isValid && !!model)
    }

    update()

    const unsubscribe = pb.authStore.onChange(update)
    return () => unsubscribe()
  }, [pb])

  return {
    user,
    token,
    isLoggedIn,
    pb,
  }
}
