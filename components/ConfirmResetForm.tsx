'use client'
import { useState, useMemo } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PasswordField } from '@/components'

interface Props {
  token: string
}

export default function ConfirmResetForm({ token }: Props) {
  const pb = useMemo(() => createPocketBase(false), [])

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(undefined)

    if (password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    try {
      await pb.collection('users').confirmPasswordReset(token, password, confirm)
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido.'
      setError(message)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Senha redefinida!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Você já pode{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              entrar
            </a>{' '}
            com sua nova senha.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Redefinir sua senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Nova senha</Label>
            <PasswordField
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirme a senha</Label>
            <PasswordField
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-error-600">{error}</p>}
          <Button type="submit" className="w-full">
            Redefinir senha
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
