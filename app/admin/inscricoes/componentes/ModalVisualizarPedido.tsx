'use client'
import { useEffect, useState } from 'react'
import { X, Copy } from 'lucide-react'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import { useToast } from '@/lib/context/ToastContext'
import { logInfo } from '@/lib/logger'

interface Props {
  pedidoId: string
  onClose: () => void
}

type PedidoExpandido = {
  id: string
  valor: number
  status: string
  produto: string[]
  id_pagamento?: string
  link_pagamento?: string
  cor?: string
  tamanho?: string
  genero?: string
  email?: string
  expand?: {
    campo?: { nome?: string }
    responsavel?: { nome?: string; id?: string }
    id_inscricao?: {
      nome: string
      telefone: string
      cpf: string
      evento: string
      expand?: { criado_por?: { id?: string } }
    }
    produto?: { nome: string } | { nome: string }[]
  }
}

export default function ModalVisualizarPedido({ pedidoId, onClose }: Props) {
  const [pedido, setPedido] = useState<PedidoExpandido | null>(null)
  const [loading, setLoading] = useState(true)
  const [reenviando, setReenviando] = useState(false)
  const [copiando, setCopiando] = useState(false)
  const [urlPagamento, setUrlPagamento] = useState('')
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    fetch(`/api/pedidos/${pedidoId}`, {
      credentials: 'include',
      signal,
    })
      .then((res) => res.json())
      .then((res) => {
        setPedido(res as PedidoExpandido)
        if (res.link_pagamento) {
          setUrlPagamento(res.link_pagamento)
        }
      })
      .catch(() => showError('Erro ao carregar dados do pedido'))
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [pedidoId, showError])

  const reenviarPagamento = async () => {
    if (!pedido?.expand?.id_inscricao || !pedido.link_pagamento) {
      return
    }

    const url = pedido.link_pagamento

    setReenviando(true)
    setUrlPagamento(url)
    try {
      if (pedido.expand?.responsavel?.id) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'confirmacao_inscricao',
            userId: pedido.expand.responsavel.id,
            paymentLink: url,
          }),
        })
      }

      fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: pedido.expand.id_inscricao.nome,
          telefone: pedido.expand.id_inscricao.telefone,
          cpf: pedido.expand.id_inscricao.cpf,
          evento: pedido.expand.id_inscricao.evento,
          liderId: pedido.expand?.responsavel?.id,
          pedidoId: pedido.id,
          valor: pedido.valor,
          url_pagamento: url,
        }),
      }).catch((err) => logInfo('⚠️ Falha ao notificar o n8n', err))

      const userId = pedido.expand.id_inscricao.expand?.criado_por?.id
      if (userId) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'confirmacao_inscricao',
            userId,
            paymentLink: url,
          }),
        })
      }

      showSuccess('Link reenviado com sucesso!')
    } catch {
      showError('Erro ao reenviar link.')
    } finally {
      setReenviando(false)
    }
  }

  const copiarLink = async () => {
    if (!urlPagamento) return
    await navigator.clipboard.writeText(urlPagamento)
    setCopiando(true)
    setTimeout(() => setCopiando(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center px-2">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-4 text-purple-700 text-center">
          📦 Detalhes do Pedido
        </h3>

        {loading || !pedido ? (
          <LoadingOverlay show={true} text="Carregando..." />
        ) : (
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>ID:</strong> {pedido.id}
            </p>
            <p>
              <strong>Valor:</strong> R$ {pedido.valor?.toFixed(2)}
            </p>
            <p>
              <strong>Status:</strong> {pedido.status}
            </p>
            <p>
              <strong>Produto:</strong>{' '}
              {Array.isArray(pedido.expand?.produto)
                ? pedido.expand.produto.map((p) => p.nome).join(', ')
                : pedido.expand?.produto?.nome || pedido.produto.join(', ')}
            </p>
            <p>
              <strong>Tamanho:</strong> {pedido.tamanho || '—'}
            </p>
            <p>
              <strong>Cor:</strong> {pedido.cor || '—'}
            </p>
            <p>
              <strong>Gênero:</strong> {pedido.genero || '—'}
            </p>
            <p>
              <strong>E-mail:</strong> {pedido.email || '—'}
            </p>
            <p>
              <strong>Campo:</strong> {pedido.expand?.campo?.nome || '—'}
            </p>
            <p>
              <strong>Responsável:</strong>{' '}
              {pedido.expand?.responsavel?.nome || '—'}
            </p>

            <button
              onClick={reenviarPagamento}
              disabled={reenviando}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
            >
              {reenviando ? 'Reenviando...' : '📤 Reenviar link de pagamento'}
            </button>

            {urlPagamento && (
              <div className="mt-3 flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                <span className="text-xs text-gray-600 truncate">
                  {urlPagamento}
                </span>
                <button
                  onClick={copiarLink}
                  className="text-purple-600 hover:text-purple-800 ml-2"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}

            {copiando && (
              <p className="text-xs text-green-600 text-center animate-pulse">
                ✅ Link copiado!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
