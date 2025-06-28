'use client'

import { usePathname } from 'next/navigation'
import Header from './HeaderAdmin'
import Footer from './Footer'
import BackToTopButton from '@/app/admin/components/BackToTopButton'
import NotificationBell from '@/app/admin/components/NotificationBell'
import TourIcon from '@/app/admin/components/TourIcon'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useSyncTenant } from '@/lib/hooks/useSyncTenant'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isInscricaoPublica = /^\/inscricoes\/[^/]+\/[^/]+$/.test(pathname)

  const { isLoggedIn, user } = useAuthContext()
  useSyncTenant()

  return (
    <>
      {!isInscricaoPublica && <Header />}
      <main className="min-h-screen text-[var(--text-primary)]">
        {children}
      </main>
      <Footer />
      {isLoggedIn && user?.role === 'coordenador' && (
        <>
          <NotificationBell />
          <TourIcon />
        </>
      )}
      <BackToTopButton />
    </>
  )
}
