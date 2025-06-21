'use client'

import { useState, useEffect } from 'react'
import { Loader2 as Spinner } from 'lucide-react'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import {
  fetchBankAccounts,
  fetchPixKeys,
  type ClienteContaBancariaRecord,
  type PixKeyRecord,
} from '@/lib/bankAccounts'

interface TransferenciaFormProps {
  onTransfer?: (
    destino: string,
    valor: number,
    description: string,
    isPix: boolean,
    pixKey?: PixKeyRecord,
  ) => Promise<void> | void
}

export default function TransferenciaForm({
  onTransfer,
}: TransferenciaFormProps) {
  const [destino, setDestino] = useState('')
  const [valor, setValor] = useState('')
  const [description, setDescription] = useState('')
  type ContaOption =
    | (ClienteContaBancariaRecord & { kind: 'bank' })
    | (PixKeyRecord & { kind: 'pix' })
  const [contas, setContas] = useState<ContaOption[]>([])
  const [loading, setLoading] = useState(false)
  const { tenantId } = useAuthContext()
  const { showError } = useToast()

  const selected = contas.find((c) => c.id === destino)
  const isPix = selected?.kind === 'pix'

  useEffect(() => {
    if (!tenantId) return
    Promise.all([fetchBankAccounts(), fetchPixKeys()])
      .then(([banks, pix]) =>
        setContas([
          ...banks.map((b) => ({ ...b, kind: 'bank' as const })),
          ...pix.map((p) => ({ ...p, kind: 'pix' as const })),
        ]),
      )
      .catch(() => setContas([]))
  }, [tenantId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(valor)
    if (!destino || isNaN(parsed) || parsed <= 0) {
      showError('Dados inv\u00e1lidos.')
      return
    }
    setLoading(true)
    try {
      const pixKey = isPix
        ? (selected as PixKeyRecord & { kind: 'pix' })
        : undefined
      await onTransfer?.(destino, parsed, description, isPix, pixKey)
    } catch {
      showError('Erro ao transferir.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <select
        className="input-base"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
      >
        <option value="">Selecione a conta</option>
        {contas.map((c) => (
          <option key={`${c.kind}-${c.id}`} value={c.id}>
            {c.kind === 'bank'
              ? `Conta Banc\u00e1ria: ${c.accountName} / ${c.ownerName}`
              : `PIX: ${c.pixAddressKey}`}
          </option>
        ))}
      </select>
      {isPix && (
        <input
          className="input-base"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      )}
      <input
        type="number"
        className="input-base"
        placeholder="Valor (R$)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner className="w-4 h-4 animate-spin" />
            Enviando...
          </span>
        ) : (
          'Transferir'
        )}
      </button>
    </form>
  )
}
