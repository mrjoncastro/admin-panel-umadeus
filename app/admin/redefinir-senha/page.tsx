'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'

// Ajuste o path aqui conforme a localização real do arquivo:
const RedefinirSenhaClient = dynamic(() => import('./RedefinirSenhaClient'), {
  ssr: false,
  loading: () => <LoadingOverlay show={true} text="Carregando..." />,
})

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<LoadingOverlay show={true} text="Carregando..." />}>
      <RedefinirSenhaClient />
    </Suspense>
  )
}
