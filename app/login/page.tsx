
import LoginForm from '@/components/templates/LoginForm'
import LayoutWrapper from '@/components/templates/LayoutWrapper'

interface LoginPageProps {
  searchParams?: { redirectTo?: string; redirect?: string }
}

function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo = searchParams?.redirectTo || searchParams?.redirect

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

export default LoginPage as unknown as (props: unknown) => JSX.Element
