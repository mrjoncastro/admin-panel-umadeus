'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/lib/context/ToastContext'
import '@/app/globals.css' // Certifique-se de que o CSS global está importado
import { PasswordField } from '@/components'

export default function LoginForm({
  redirectTo,
  children,
}: {
  redirectTo?: string
  children?: React.ReactNode
}) {
  const router = useRouter()
  const { login, logout, isLoggedIn, isLoading, user } = useAuthContext()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showError } = useToast()

  // Redirecionamento pós-login com verificação de sucesso
  useEffect(() => {
    if (!isLoading && isLoggedIn && user) {
      const target = redirectTo || '/'

      const prevUrl =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : ''

      const eventoIdMatch = redirectTo?.match(/evento=([^&]+)/)
      const eventoId = eventoIdMatch ? eventoIdMatch[1] : null

      const handleFail = () => {
        if (eventoId) {
          logout().catch(() => {})
          showError('Não foi possível retomar a inscrição automaticamente.')
          router.replace(`/inscricoes?evento=${eventoId}`)
        } else {
          router.replace('/')
        }
      }

      try {
        router.replace(target)
      } catch {
        handleFail()
        return
      }

      const timer = setTimeout(() => {
        const currentUrl =
          typeof window !== 'undefined'
            ? window.location.pathname + window.location.search
            : ''
        if (currentUrl === prevUrl) {
          handleFail()
        }
      }, 1000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isLoading, isLoggedIn, user, router, redirectTo, logout, showError])

  if (!isLoading && isLoggedIn) {
    return null // impede que o componente renderize novamente
  }

  const handleLogin = async () => {
    setIsSubmitting(true)

    try {
      await login(email, senha)
      // Redirecionamento ocorre no useEffect
    } catch (e: unknown) {
      console.error('❌ Erro no login:', e)
      if (e instanceof Error) {
        showError(e.message || 'Credenciais inválidas.')
      } else {
        showError('Credenciais inválidas.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <p className="text-gray-700 text-sm">Verificando sessão...</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
      <div className="relative z-10 w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-animated rounded-2xl backdrop-blur-md text-gray-200 shadow-lg">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Image
            src="/img/logo_umadeus_branco.png"
            alt="Logo UMADEUS"
            width={120}
            height={120}
            priority
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl sm:text-3xl font-bold text-center text-gray-300 mb-2"
        >
          Bem-vindo!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-sm sm:text-base text-gray-300 mb-6"
        >
          Acesse o painel
        </motion.p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleLogin()
          }}
          className="space-y-6"
        >
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base w-full rounded-md px-4 py-2"
            required
          />
          <PasswordField
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input-base w-full rounded-md px-4 py-2"
            showValidation={false}
            required
          />

          <div className="text-right text-sm">
            <Link
              href="/auth/confirm-password-reset"
              className="underline text-gray-300 hover:text-white transition"
            >
              Esqueci minha senha
            </Link>
          </div>

          {children && (
            <div className="text-sm text-gray-300 text-center">{children}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn w-full rounded-md py-2 font-semibold text-white transition ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[var(--accent)]'
            }`}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
