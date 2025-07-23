import { logger } from '@/lib/logger'
'use client'

import { useEffect, useState } from 'react'
import ListaClientes from './components/ListaClientes'
import ModalEditarInscricao from '../inscricoes/componentes/ModalEdit'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import type { Inscricao } from '@/types'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export default function ClientesPage() {
  const { tenantId } = useAuthContext()
  const { showError, showSuccess } = useToast()
  const { authChecked } = useAuthGuard(['coordenador', 'lider'])
  const [clientes, setClientes] = useState<
    (Inscricao & { eventoId?: string })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [clienteEmEdicao, setClienteEmEdicao] = useState<
    (Inscricao & { eventoId?: string }) | null
  >(null)

  useEffect(() => {
    async function fetchClientes() {
      try {
        const params = new URLSearchParams({
          filter: `cliente='${tenantId}'`,
          expand: 'pedido,evento',
          sort: '-created',
        })
        const res = await fetch(`/admin/api/clientes?${params.toString()}`)
        if (!res.ok) throw new Error('Erro ao carregar')
        const lista: Inscricao[] = await res.json()
        const mapped = lista.map((c) => ({
          ...c,
          eventoId: c.evento,
          evento: c.expand?.evento?.titulo || c.evento,
        }))
        setClientes(mapped)
      } catch (err) {
        logger.error('Erro ao carregar clientes', err)
        showError('Erro ao carregar clientes')
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [tenantId, showError])

  if (!authChecked) return null

  const salvarEdicao = async (
    atualizada: Partial<Inscricao & { eventoId?: string }>,
  ) => {
    if (!clienteEmEdicao) return
    try {
      const res = await fetch(`/admin/api/clientes/${clienteEmEdicao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...atualizada,
          evento: atualizada.eventoId ?? clienteEmEdicao.eventoId,
        }),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteEmEdicao.id ? { ...c, ...atualizada } : c,
        ),
      )
      showSuccess('Cliente atualizado')
    } catch (err) {
      logger.error('Erro ao salvar cliente', err)
      showError('Erro ao salvar cliente')
    } finally {
      setClienteEmEdicao(null)
    }
  }

  if (loading)
    return <LoadingOverlay show={true} text="Carregando clientes..." />

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="heading">Clientes</h2>
      <ListaClientes clientes={clientes} onEdit={setClienteEmEdicao} />
      {clienteEmEdicao && (
        <ModalEditarInscricao
          inscricao={clienteEmEdicao as Inscricao & { eventoId: string }}
          onClose={() => setClienteEmEdicao(null)}
          onSave={salvarEdicao}
        />
      )}
    </main>
  )
}
