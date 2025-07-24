import { logger } from '@/lib/logger'
'use client'
import { useState } from 'react'
import { useToast } from '@/lib/context/ToastContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RequestResetForm() {
  const [email, setEmail] = useState('')
  const { showSuccess, showError } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/usuarios/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Erro')
      showSuccess('Enviamos um link para redefinir sua senha.')
      setEmail('')
    } catch (err) {
      logger.error(err)
      showError('Não foi possível enviar o link. Verifique o e-mail.')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recuperar acesso</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Enviar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
