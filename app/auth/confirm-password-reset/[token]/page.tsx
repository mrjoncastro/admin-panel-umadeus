// path: app/auth/confirm-password-reset/[token]/page.tsx

import ConfirmResetForm from '@/components/ConfirmResetForm'

type Props = {
  params: { token: string }
}

export default function Page({ params }: Props) {
  const { token } = params

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ConfirmResetForm token={token} />
    </div>
  )
}
