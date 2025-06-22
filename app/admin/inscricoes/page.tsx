'use client'

import { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'
import { saveAs } from 'file-saver'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import ModalEditarInscricao from './componentes/ModalEdit'
import ModalVisualizarPedido from './componentes/ModalVisualizarPedido'
import { CheckCircle, XCircle, Pencil, Trash2, Eye } from 'lucide-react'
import TooltipIcon from '../components/TooltipIcon'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { type PaymentMethod } from '@/lib/asaasFees'
import type {
  Evento,
  Inscricao as InscricaoRecord,
  Produto,
} from '@/types'

const statusBadge = {
  pendente: 'bg-yellow-100 text-yellow-800',
  aguardando_pagamento: 'bg-blue-100 text-blue-800',
  confirmado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
} as const

type StatusInscricao = keyof typeof statusBadge

type Inscricao = {
  id: string
  nome: string
  telefone: string
  cpf: string
  /** Título do evento para exibição */
  evento: string
  /** ID do evento */
  eventoId: string
  status: StatusInscricao
  created: string
  campo?: string
  tamanho?: string
  genero?: string
  confirmado_por_lider?: boolean
  aprovada?: boolean
  data_nascimento?: string
  criado_por?: string
  pedido_id?: string | null
}

export default function ListaInscricoesPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const tenantId = user?.cliente || ''
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [role, setRole] = useState('')
  const [linkPublico, setLinkPublico] = useState('')
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoId, setEventoId] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [inscricaoEmEdicao, setInscricaoEmEdicao] = useState<Inscricao | null>(
    null,
  )
  const { showError, showSuccess } = useToast()
  const placeholderBusca =
    role === 'coordenador'
      ? 'Buscar por nome, telefone, CPF ou campo'
      : 'Buscar por nome, telefone ou CPF'

  useEffect(() => {
    if (!authChecked) return

    if (!user) {
      showError('Sessão expirada ou inválida.')
      setLoading(false)
      return
    }

    setRole(user.role)

    fetch('/api/eventos', { credentials: 'include' })
      .then((r: Response): Promise<Evento[]> => r.json())
      .then((evs: Evento[]) => {
        setEventos(evs)
        if (evs.length > 0) {
          setEventoId(evs[0].id)
        } else {
          setEventoId('')
          setLinkPublico('')
        }
      })
      .catch(() => {
        showError('Erro ao carregar eventos.')
        setLinkPublico('')
      })

    const baseFiltro = `cliente='${tenantId}'`
    const filtro =
      user.role === 'coordenador'
        ? baseFiltro
        : `campo='${user.campo}' && ${baseFiltro}`

    fetch(
      `/api/inscricoes?${new URLSearchParams({ filter: filtro }).toString()}`,
      {
        credentials: 'include',
      },
    )
      .then(
        (
          r: Response,
        ): Promise<InscricaoRecord[] | { items: InscricaoRecord[] }> =>
          r.json(),
      )
      .then((res) => {
        const lista = (Array.isArray(res) ? res : res.items).map((r) => ({
          id: r.id,
          nome: r.nome ?? '',
          telefone: r.telefone ?? '',
          evento: r.expand?.evento?.titulo ?? '—',
          eventoId: r.evento ?? '',
          cpf: r.cpf ?? '',
          status: r.status ?? 'pendente',
          created: r.created ?? '',
          campo: r.expand?.campo?.nome ?? '—',
          tamanho: r.tamanho ?? '',
          produto: r.produto ?? '',
          genero: r.genero ?? '',
          data_nascimento: r.data_nascimento ?? '',
          criado_por: r.criado_por ?? '',
          confirmado_por_lider: r.confirmado_por_lider ?? false,
          aprovada: r.aprovada ?? false,
          pedido_status: r.expand?.pedido?.status ?? null,
          pedido_id: r.expand?.pedido?.id ?? null,
        }))

        setInscricoes(lista)
      })
      .catch(() => showError('Erro ao carregar inscrições.'))
      .finally(() => setLoading(false))

    if (user.role === 'coordenador') {
      fetch('/api/campos', { credentials: 'include' }).catch(() => {})
    }
  }, [authChecked, tenantId, user, showError])

  useEffect(() => {
    if (!user || !eventoId) {
      setLinkPublico('')
      return
    }
    setLinkPublico(
      `${window.location.origin}/inscricoes/lider/${user.id}/evento/${eventoId}`,
    )
  }, [eventoId, user])

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkPublico)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      showError('Não foi possível copiar o link.')
    }
  }

  const deletarInscricao = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta inscrição?')) {
      try {
        await fetch(`/api/inscricoes/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        setInscricoes((prev) => prev.filter((i) => i.id !== id))
        showSuccess('Inscrição excluída.')
      } catch {
        showError('Erro ao excluir inscrição.')
      }
    }
  }
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

const confirmarInscricao = async (id: string) => {
  try {
    console.log('[confirmarInscricao] Iniciando confirmação para id:', id)
    setConfirmandoId(id)

    // 1. Buscar inscrição com expand do campo e produtos
    const inscricaoRes = await fetch(
      `/api/inscricoes/${id}?expand=campo,produto`,
      { credentials: 'include' },
    )
    console.log('[confirmarInscricao] Status inscricaoRes:', inscricaoRes.status)
    const inscricao: InscricaoRecord & {
      expand?: { produtos?: Produto | Produto[] }
    } = await inscricaoRes.json()
    console.log('[confirmarInscricao] inscricao:', inscricao)

    // Checar campo correto: produto ou produtos
    type InscricaoWithProdutos = InscricaoRecord & { produtos?: string }
    const produtoId =
      inscricao.produto || (inscricao as InscricaoWithProdutos).produtos
    console.log('[confirmarInscricao] produtoId:', produtoId)

    // Extrair produto do expand (array ou objeto)
    let produtoRecord: Produto | undefined = undefined

    // Se expand já trouxe produtos (array ou objeto)
    if (inscricao.expand?.produtos) {
      if (Array.isArray(inscricao.expand.produtos)) {
        produtoRecord = inscricao.expand.produtos.find(
          (p: Produto) => p.id === produtoId || p.id === inscricao.produto,
        )
        console.log('[confirmarInscricao] produtoRecord (array):', produtoRecord)
      } else if (typeof inscricao.expand.produtos === 'object') {
        produtoRecord = inscricao.expand.produtos as Produto
        console.log('[confirmarInscricao] produtoRecord (obj):', produtoRecord)
      }
    }

    // Fallback se não achou pelo expand
    if (!produtoRecord && produtoId) {
      try {
        const prodRes = await fetch(`/api/produtos/${produtoId}`, {
          credentials: 'include',
        })
        console.log('[confirmarInscricao] Status prodRes:', prodRes.status)
        if (prodRes.ok) {
          produtoRecord = await prodRes.json()
          console.log('[confirmarInscricao] produtoRecord (fallback):', produtoRecord)
        }
      } catch (e) {
        console.error('[confirmarInscricao] Erro fetch produto:', e)
      }
    }

    // Log do produto final escolhido
    console.log('[confirmarInscricao] Produto final:', produtoRecord)

    // Se mesmo assim não encontrou, aborta!
    if (!produtoRecord || typeof produtoRecord.preco !== 'number') {
      showError('Não foi possível identificar o produto ou o preço da inscrição.')
      setConfirmandoId(null)
      console.log('[confirmarInscricao] Produto/preço não encontrado, abortando!')
      return
    }

    // Obter o campo expandido normalmente
    const campo = inscricao.expand?.campo as
      | { id?: string; responsavel?: string }
      | undefined
    console.log('[confirmarInscricao] campo expand:', campo)

    const insc = inscricao as InscricaoRecord & {
      paymentMethod?: PaymentMethod
      installments?: number
    }

    const metodo = insc.paymentMethod ?? 'boleto'
    const parcelas = insc.installments ?? 1
    console.log('[confirmarInscricao] metodo:', metodo, 'parcelas:', parcelas)

    // Valor base do produto
    const precoProduto = Number(produtoRecord?.preco ?? 0)
    console.log('[confirmarInscricao] precoProduto:', precoProduto)

    // Aqui você pode aplicar algum cálculo se desejar
    const gross = precoProduto // ajuste aqui caso queira aplicar taxas/descontos
    console.log('[confirmarInscricao] gross:', gross)

      const pedidoRes = await fetch('/api/pedidos', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_inscricao: id,
          valor: precoProduto,
          status: 'pendente',
          produto: produtoRecord.nome || 'Produto',
          cores: Array.isArray(produtoRecord.cores)
            ? produtoRecord.cores[0] || 'Roxo'
            : (produtoRecord.cores as string | undefined) || 'Roxo',
          tamanho:
            inscricao.tamanho ||
            (Array.isArray(produtoRecord.tamanhos)
              ? produtoRecord.tamanhos[0]
              : (produtoRecord.tamanhos as string | undefined)),
          genero:
            inscricao.genero ||
            (Array.isArray(produtoRecord.generos)
              ? produtoRecord.generos[0]
              : (produtoRecord.generos as string | undefined)),
          email: inscricao.email,
          cliente: tenantId,
          campo: campo?.id,
          responsavel: inscricao.criado_por,
          canal: 'inscricao',
        }),
      })

      // Agora sim, apenas aguardamos o JSON retornado
      const pedido: { pedidoId: string } = await pedidoRes.json()

      // 3. Gerar link de pagamento via Asaas
      const asaasRes = await fetch('/api/asaas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: pedido.pedidoId,
          valorBruto: precoProduto,
          paymentMethod: metodo,
          installments: parcelas,
        }),
      })
      const checkout = await asaasRes.json()

    if (!asaasRes.ok || !checkout?.url) {
      console.error('[confirmarInscricao] Erro ao gerar link de pagamento:', checkout)
      throw new Error('Erro ao gerar link de pagamento.')
    }

      // 4. Atualizar inscrição com o ID do pedido
      await fetch(`/api/inscricoes/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido: pedido.pedidoId,
          status: 'aguardando_pagamento',
          confirmado_por_lider: true,
          aprovada: true,
        }),
      })

      // Atualizar estado local das inscrições
      setInscricoes((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: 'aguardando_pagamento',
                confirmado_por_lider: true,
                aprovada: true,
              }
            : i,
        ),
      )

      // 🔹 6. Notificar via n8n webhook de forma assíncrona
      fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: inscricao.nome,
          telefone: inscricao.telefone,
          cpf: inscricao.cpf,
          evento: inscricao.evento,
          liderId: campo?.responsavel,
          pedidoId: pedido.pedidoId,
          cliente: tenantId,
          valor: gross,
          url_pagamento: checkout.url,
        }),
      }).catch(() => {})

    // 🔹 7. Mostrar sucesso visual
    showSuccess('Link de pagamento enviado com sucesso!')
  } catch (e) {
    console.error('[confirmarInscricao] Erro:', e)
    showError('Erro ao confirmar inscrição e gerar pedido.')
  } finally {
    setConfirmandoId(null)
    console.log('[confirmarInscricao] Fim do fluxo.')
  }
}


  const [inscricaoParaRecusar, setInscricaoParaRecusar] =
    useState<Inscricao | null>(null)

  const exportarCSV = () => {
    const header = [
      'Nome',
      'Telefone',
      'Evento',
      'Status',
      'Campo',
      'Criado em',
    ]
    const linhas = inscricoes.map((i) => [
      i.nome,
      i.telefone,
      i.evento,
      i.status,
      i.campo || '',
      new Date(i.created).toLocaleDateString('pt-BR'),
    ])

    const csvContent = [header, ...linhas]
      .map((linha) => linha.map((valor) => `"${valor}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const hoje = new Date().toISOString().split('T')[0]
    saveAs(blob, `inscricoes_${hoje}.csv`)
  }

  const inscricoesFiltradas = inscricoes.filter((i) => {
    const busca = filtroBusca.toLowerCase()

    const matchStatus = filtroStatus === '' || i.status === filtroStatus

    const matchBusca =
      filtroBusca === '' ||
      i.nome.toLowerCase().includes(busca) ||
      i.telefone?.toLowerCase().includes(busca) ||
      i.cpf?.toLowerCase().includes(busca) ||
      (role === 'coordenador' && i.campo?.toLowerCase().includes(busca))

    return matchStatus && matchBusca
  })

  const [pedidoSelecionado, setPedidoSelecionado] = useState<string | null>(
    null,
  )

  if (loading)
    return <LoadingOverlay show={true} text="Carregando inscrições..." />

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="heading">Inscrições Recebidas</h2>

      {/* Link público */}
      {role === 'lider' && (
        <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm shadow-sm">
          <p className="font-semibold mb-2">📎 Link de inscrição pública:</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {eventos.length > 0 && (
              <select
                value={eventoId}
                onChange={(e) => setEventoId(e.target.value)}
                className="border rounded p-2 text-xs bg-white shadow-sm"
              >
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.titulo}
                  </option>
                ))}
              </select>
            )}
            <input
              readOnly
              value={linkPublico}
              className="w-full p-2 border rounded bg-white text-gray-700 font-mono text-xs shadow-sm"
            />
            <button onClick={copiarLink} className="btn btn-primary text-xs">
              <Copy size={14} />
            </button>
          </div>
          {copiado && (
            <span className="text-green-600 text-xs animate-pulse mt-1 block">
              ✅ Link copiado: {linkPublico}
            </span>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder={placeholderBusca}
          className="border rounded px-4 py-2 text-sm w-full md:w-64 shadow-sm"
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
        />

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border rounded px-4 py-2 text-sm bg-white shadow-sm"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button
          onClick={exportarCSV}
          className="text-sm px-4 py-2 rounded btn btn-primary text-white transition"
        >
          Exportar CSV
        </button>
      </div>

      {/* Tabela */}
      {inscricoesFiltradas.length === 0 ? (
        <p className="text-center text-gray-500">
          Nenhuma inscrição encontrada.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Evento</th>
                <th>Status</th>
                <th>Campo</th>
                <th>Criado em</th>
                <th>Confirmação</th>
                {role === 'coordenador' && <th>Ação</th>}
              </tr>
            </thead>
            <tbody>
              {inscricoesFiltradas.map((i) => (
                <tr key={i.id}>
                  <td className="font-medium">{i.nome}</td>
                  <td>{i.telefone}</td>
                  <td>{i.evento}</td>
                  <td className="capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusBadge[i.status]
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td>{i.campo}</td>
                  <td>{new Date(i.created).toLocaleDateString('pt-BR')}</td>
                  <td className="text-left text-xs">
                    <div className="flex items-center gap-3">
                      {(role === 'lider' || role === 'coordenador') &&
                      i.status === 'pendente' &&
                      !i.confirmado_por_lider ? (
                        <>
                          <TooltipIcon label="Confirmar inscrição">
                            <button
                              onClick={() => confirmarInscricao(i.id)}
                              disabled={confirmandoId === i.id}
                              className={`text-green-600 hover:text-green-700 cursor-pointer ${
                                confirmandoId === i.id ? 'opacity-50' : ''
                              }`}
                            >
                              {confirmandoId === i.id ? (
                                <svg
                                  className="w-5 h-5 animate-spin text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                  ></path>
                                </svg>
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </button>
                          </TooltipIcon>

                          <TooltipIcon label="Recusar inscrição">
                            <button
                              onClick={() => setInscricaoParaRecusar(i)}
                              className="text-red-600 hover:text-red-700 cursor-pointer"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </TooltipIcon>
                        </>
                      ) : i.confirmado_por_lider ? (
                        <TooltipIcon label="Confirmado">
                          <CheckCircle className="text-green-600 w-5 h-5" />
                        </TooltipIcon>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 text-left text-xs">
                    <div className="flex items-center gap-3">
                      <TooltipIcon label="Editar">
                        <button
                          onClick={() => setInscricaoEmEdicao(i)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </TooltipIcon>

                      <TooltipIcon label="Excluir">
                        <button
                          onClick={() => deletarInscricao(i.id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TooltipIcon>

                      {i.pedido_id ? (
                        <TooltipIcon label="Visualizar pedido">
                          <button
                            onClick={() => setPedidoSelecionado(i.pedido_id!)}
                            className="text-purple-600 hover:text-purple-800 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </TooltipIcon>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {inscricaoEmEdicao && (
        <ModalEditarInscricao
          inscricao={inscricaoEmEdicao}
          onClose={() => setInscricaoEmEdicao(null)}
          onSave={async (
            dadosAtualizados: Partial<Inscricao & { eventoId: string }>,
          ) => {
            await fetch(`/api/inscricoes/${inscricaoEmEdicao.id}`, {
              method: 'PATCH',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...dadosAtualizados,
                evento: dadosAtualizados.eventoId ?? inscricaoEmEdicao.eventoId,
              }),
            })
            setInscricoes((prev) =>
              prev.map((i) =>
                i.id === inscricaoEmEdicao.id
                  ? { ...i, ...dadosAtualizados }
                  : i,
              ),
            )
            setInscricaoEmEdicao(null)
          }}
        />
      )}

      {inscricaoParaRecusar && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Recusar Inscrição</h2>
            <p className="text-sm text-gray-700 mb-4">
              Tem certeza que deseja recusar a inscrição de{' '}
              <strong>{inscricaoParaRecusar.nome}</strong>? Essa ação definirá o
              status como <strong className="text-red-600">cancelado</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setInscricaoParaRecusar(null)}
                className="btn btn-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await fetch(`/api/inscricoes/${inscricaoParaRecusar.id}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      status: 'cancelado',
                      confirmado_por_lider: true,
                      aprovada: false,
                    }),
                  })
                  setInscricoes((prev) =>
                    prev.map((i) =>
                      i.id === inscricaoParaRecusar.id
                        ? {
                            ...i,
                            status: 'cancelado',
                            confirmado_por_lider: true,
                            aprovada: false,
                          }
                        : i,
                    ),
                  )
                  setInscricaoParaRecusar(null)
                }}
                className="btn btn-danger text-sm"
              >
                Confirmar recusa
              </button>
            </div>
          </div>
        </div>
      )}

      {pedidoSelecionado && (
        <ModalVisualizarPedido
          pedidoId={pedidoSelecionado}
          onClose={() => setPedidoSelecionado(null)}
        />
      )}
    </main>
  )
}
