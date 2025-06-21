'use client'
// Componente público para redefinição de senha

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import createPocketBase from '@/lib/pocketbase'
import { useToast } from '@/lib/context/ToastContext'

export default function RedefinirSenhaClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pb = useMemo(() => createPocketBase(), [])
  const token = searchParams.get('token') ?? ''

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    if (!token) showError('Token de redefinição inválido ou ausente.')
  }, [token, showError])

  const handleSubmit = async () => {
    if (novaSenha !== confirmacao) {
      showError('As senhas não coincidem.')
      return
    }
    try {
      await pb
        .collection('usuarios')
        .confirmPasswordReset(token, novaSenha, confirmacao)
      showSuccess('Senha redefinida com sucesso!')
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      showError('Não foi possível redefinir. O link pode ter expirado.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-secondary)] px-4 text-[var(--background)]">
      <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-6 border border-[var(--background)]">
        <h1 className="text-2xl font-bold text-center">Redefinir sua senha</h1>

        <input
          type="password"
          placeholder="Nova senha"
          className="w-full border p-2 rounded"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          className="w-full border p-2 rounded"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg"
        >
          Redefinir senha
        </button>
      </div>
    </main>
  )
}
