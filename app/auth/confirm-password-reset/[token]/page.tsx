// File: app/auth/confirm-password-reset/[token]/page.tsx
import ConfirmResetForm from '@/components/ConfirmResetForm'
import { ReactNode } from 'react'

interface PageProps {
  params: {
    token: string
  }
}

export default function Page({ params }: PageProps): ReactNode {
  const { token } = params

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ConfirmResetForm token={token} />
    </div>
  )
}
