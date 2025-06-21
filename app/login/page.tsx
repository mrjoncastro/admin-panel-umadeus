'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginForm from '@/components/templates/LoginForm'
import LayoutWrapper from '@/components/templates/LayoutWrapper'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  )
}

function LoginClient() {
  'use client'
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || undefined

  return (
    <LayoutWrapper>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col justify-center items-center px-6 md:px-8 py-6 text-[var(--text-primary)]">
          <div className="w-full">
            <div>
              <LoginForm redirectTo={redirectTo}>
                Ainda não tem conta?{' '}
                <a
                  href="/signup"
                  className="underline hover:text-[var(--accent)] transition"
                >
                  Crie uma agora
                </a>
              </LoginForm>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
