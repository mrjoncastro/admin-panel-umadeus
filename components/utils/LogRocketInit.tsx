'use client'
import { useEffect } from 'react'
import LogRocket from 'logrocket'
import { useAuthContext } from '@/lib/context/AuthContext'

export default function LogRocketInit() {
  const { user } = useAuthContext()

  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_LOGROCKET_ID
    if (id) {
      LogRocket.init(id)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      try {
        LogRocket.identify(user.id, {
          name: user.nome,
          email: user.email,
          role: user.role,
        })
      } catch (err) {
        console.error('Falha ao identificar usuario no LogRocket', err)
      }
    }
  }, [user])

  return null
}
