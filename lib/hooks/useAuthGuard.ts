// lib/hooks/useAuthGuard

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '../context/AuthContext'

export function useAuthGuard(
  rolesPermitidos: string[] = ['coordenador', 'lider'],
) {
  const { user, isLoggedIn, isLoading } = useAuthContext()
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (isLoading) {
      return
    }

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
  }, [isLoggedIn, isLoading, user, rolesPermitidos, router])

  return { user, authChecked }
}
