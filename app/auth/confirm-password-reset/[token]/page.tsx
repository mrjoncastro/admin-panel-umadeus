import ConfirmResetForm from '@/components/ConfirmResetForm'

export default async function Page({
  params,
}: {
  params: { token: string }
}) {
  const { token } = params
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ConfirmResetForm token={token} />
    </div>
  )
}
