// File: app/auth/confirm-password-reset/[token]/page.tsx
import ConfirmResetForm from '@/components/ConfirmResetForm'

interface Props {
  params: Promise<{ token: string }>
}

export default async function Page({ params }: Props) {
  const { token } = await params

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ConfirmResetForm token={token} />
    </div>
  )
}
