// Redirecionamento público para a página de login
import { redirect } from 'next/navigation'

export default function AdminIndex() {
  redirect('/login')
}
