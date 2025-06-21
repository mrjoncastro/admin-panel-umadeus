// lib/hooks/useAuthGuard

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

export function useAuthGuard(
  rolesPermitidos: string[] = ['coordenador', 'lider'],
) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login')
      return
    }

    const temPermissao = user && rolesPermitidos.includes(user.role)

    if (temPermissao) {
      setAuthChecked(true)
    } else {
      router.replace('/login')
    }
  }, [isLoggedIn, user, rolesPermitidos, router])

  return { user, authChecked }
}
