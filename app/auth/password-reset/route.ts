import { redirect } from 'next/navigation'

export function GET() {
  redirect('/auth/confirm-password-reset')
}
