'use client'

import { useEffect, useState, useMemo } from 'react'
import createPocketBase from '@/lib/pocketbase'
import ListaClientes from './components/ListaClientes'
import ModalEditarInscricao from '../inscricoes/componentes/ModalEdit'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import type { Inscricao } from '@/types'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export default function ClientesPage() {
  const pbClient = useMemo(() => createPocketBase(), [])
  const { tenantId } = useAuthContext()
  const { showError, showSuccess } = useToast()
  const { user, pb, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const [clientes, setClientes] = useState<
    (Inscricao & { eventoId?: string })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [clienteEmEdicao, setClienteEmEdicao] = useState<
    (Inscricao & { eventoId?: string }) | null
  >(null)

  if (!authChecked) return null

  useEffect(() => {
    async function fetchClientes() {
      try {
        const lista = await pbClient.collection('inscricoes').getFullList<Inscricao>({
          expand: 'pedido,evento',
          sort: '-created',
          filter: `cliente='${tenantId}'`,
        })
        const mapped = lista.map((c) => ({
          ...c,
          eventoId: c.evento,
          evento: c.expand?.evento?.titulo || c.evento,
        }))
        setClientes(mapped)
      } catch (err) {
        console.error('Erro ao carregar clientes', err)
        showError('Erro ao carregar clientes')
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [pbClient, tenantId, showError])

  const salvarEdicao = async (
    atualizada: Partial<Inscricao & { eventoId?: string }>,
  ) => {
    if (!clienteEmEdicao) return
    try {
      await pbClient.collection('inscricoes').update(clienteEmEdicao.id, {
        ...atualizada,
        evento: atualizada.eventoId ?? clienteEmEdicao.eventoId,
      })
      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteEmEdicao.id ? { ...c, ...atualizada } : c,
        ),
      )
      showSuccess('Cliente atualizado')
    } catch (err) {
      console.error('Erro ao salvar cliente', err)
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
