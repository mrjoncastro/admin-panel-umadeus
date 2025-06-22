'use client'

import Header from './Header'
import Footer from './Footer'
import BackToTopButton from '@/app/admin/components/BackToTopButton'
import NotificationBell from '@/app/admin/components/NotificationBell'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useMemo } from 'react'
import { useSyncTenant } from '@/lib/hooks/useSyncTenant'

type UserRole = 'visitante' | 'usuario' | 'lider' | 'coordenador'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  useSyncTenant()
  const { isLoggedIn, user } = useAuthContext()
  const role: UserRole = useMemo(() => {
    if (!isLoggedIn) return 'visitante'
    if (user?.role === 'coordenador') return 'coordenador'
    if (user?.role === 'lider') return 'lider'
    return 'usuario'
  }, [isLoggedIn, user?.role])

  return (
    <>
      <Header />
      <main className="min-h-screen text-[var(--text-primary)]">
        {children}
      </main>
      <Footer />
      {role === 'coordenador' && <NotificationBell />}
      <BackToTopButton />
    </>
  )
}
