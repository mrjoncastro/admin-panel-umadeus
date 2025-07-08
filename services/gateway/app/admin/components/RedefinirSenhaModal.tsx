'use client'

import { useState } from 'react'
import { useToast } from '@/lib/context/ToastContext'

export default function RedefinirSenhaModal({
  onClose,
}: {
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const { showSuccess, showError } = useToast()

  const handleResetRequest = async () => {
    try {
      const res = await fetch('/api/usuarios/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Erro')
      showSuccess('Enviamos um link de redefinição para seu e-mail.')
      onClose()
    } catch (err) {
      console.error(err)
      showError('Não foi possível enviar o link. Verifique o e-mail.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-5">
        <h2 className="text-xl font-semibold text-center">Redefinir senha</h2>

        <input
          type="email"
          placeholder="Digite seu e-mail"
          className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleResetRequest}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
