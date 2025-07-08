'use client'
import { useEffect } from 'react'
import LogRocket from 'logrocket'
import { useAuthContext } from '@/lib/context/AuthContext'

export default function LogRocketInit() {
  const { user } = useAuthContext()

  useEffect(() => {
    LogRocket.init('4pjmeb/m24')
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
