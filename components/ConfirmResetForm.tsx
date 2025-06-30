'use client'
import { useState, useMemo } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import createPocketBase from '@/lib/pocketbase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  token: string
}

export default function ConfirmResetForm({ token }: Props) {
  const pb = useMemo(() => createPocketBase(false), [])

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
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
            <div className="relative">
              <Input
                id="password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
                aria-label="Mostrar senha"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirm">Confirme a senha</Label>
            <Input
              id="confirm"
              type={show ? 'text' : 'password'}
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
