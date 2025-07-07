'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RecuperarPagamentoPage() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    nomeUsuario: string
    link_pagamento: string
  } | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setResultado(null)
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) {
      setErro('CPF inválido')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/recuperar-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfLimpo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error || 'Falha ao recuperar link')
      } else {
        setResultado(data)
      }
    } catch {
      setErro('Falha ao recuperar link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-lg font-bold mb-4 text-center">Link de pagamento</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="CPF"
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Carregando link…' : 'Ver link de pagamento'}
        </Button>
      </form>
      {erro && <p className="mt-2 text-red-600 text-center">{erro}</p>}
      {resultado && (
        <div className="mt-6 text-center space-y-2">
          <p>
            Olá <strong>{resultado.nomeUsuario}</strong>, aqui está seu link de
            pagamento:
          </p>
          <a
            href={resultado.link_pagamento}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 underline"
          >
            ABRIR LINK
          </a>
        </div>
      )}
    </div>
  )
}
