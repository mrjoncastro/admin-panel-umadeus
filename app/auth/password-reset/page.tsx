import { redirect } from 'next/navigation'

export default function Page() {
  redirect('/_/auth/password-reset')
}
