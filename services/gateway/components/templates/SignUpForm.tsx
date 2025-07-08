'use client'

import CreateUserForm from './CreateUserForm'

export default function SignUpForm({
  onSuccess,
  children,
}: {
  onSuccess?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 bg-animated rounded-2xl backdrop-blur-md text-gray-200 shadow-lg">
        <CreateUserForm onSuccess={onSuccess}>{children}</CreateUserForm>
      </div>
    </div>
  )
}
