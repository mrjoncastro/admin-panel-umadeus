'use client'

import { useEffect, useState, useMemo } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import { Copy } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import ModalEditarInscricao from './componentes/ModalEdit'
import ModalVisualizarPedido from './componentes/ModalVisualizarPedido'
import { CheckCircle, XCircle, Pencil, Trash2, Eye } from 'lucide-react'
import TooltipIcon from '../components/TooltipIcon'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { type PaymentMethod } from '@/lib/asaasFees'
import type { Evento, Inscricao as InscricaoRecord, Produto } from '@/types'
import { formatDate } from '@/utils/formatDate'

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
  pedido_status?: 'pendente' | 'pago' | 'vencido' | 'cancelado' | null
  pedido_vencimento?: string | null
  produto?: string
  produtoNome?: string
}

export default function ListaInscricoesPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const pb = useMemo(() => createPocketBase(), [])
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
  const [ordenarPor, setOrdenarPor] = useState<'data' | 'alfabetica'>('data')
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('desc')
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

    const carregarInscricoes = async () => {
      if (!user) {
        showError('Sessão expirada ou inválida.')
        setLoading(false)
        return
      }

      setRole(user.role)

      try {
        const eventosRes = await fetch('/api/eventos', {
          headers: getAuthHeaders(pb),
          credentials: 'include',
        })
        const evs: Evento[] = await eventosRes.json()
        setEventos(evs)
        if (evs.length > 0) {
          setEventoId(evs[0].id)
        } else {
          setEventoId('')
          setLinkPublico('')
        }
      } catch {
        showError('Erro ao carregar eventos.')
        setLinkPublico('')
      }

      const baseFiltro = `cliente='${tenantId}'`
      const filtro =
        user.role === 'coordenador'
          ? baseFiltro
          : `campo='${user.campo}' && ${baseFiltro}`

      const params = new URLSearchParams({
        filter: filtro,
        expand: 'evento,campo,produto,pedido',
        page: '1',
        perPage: '50',
      })

      try {
        const primeiro = await fetch(`/api/inscricoes?${params.toString()}`, {
          credentials: 'include',
          headers: getAuthHeaders(pb),
        })
        const res: { items: InscricaoRecord[]; totalPages: number } =
          await primeiro.json()
        // setTotalPaginas(res.totalPages)
        let todos = res.items

        for (let p = 2; p <= res.totalPages; p++) {
          params.set('page', String(p))
          const r = await fetch(`/api/inscricoes?${params.toString()}`, {
            credentials: 'include',
            headers: getAuthHeaders(pb),
          })
          const pj: { items: InscricaoRecord[] } = await r.json()
          todos = todos.concat(pj.items)
        }

        const lista = todos.map((r) => {
          const produtoExpand = (
            r.expand as { produto?: Produto | Produto[] } | undefined
          )?.produto
          const produtoNome = Array.isArray(produtoExpand)
            ? (produtoExpand[0]?.nome ?? '')
            : (produtoExpand?.nome ?? '')
          return {
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
            produtoNome,
            genero: r.genero ?? '',
            data_nascimento: r.data_nascimento ?? '',
            criado_por: r.criado_por ?? '',
            confirmado_por_lider: r.confirmado_por_lider ?? false,
            aprovada: r.aprovada ?? false,
            pedido_status: r.expand?.pedido?.status ?? null,
            pedido_id: r.expand?.pedido?.id ?? null,
            pedido_vencimento: r.expand?.pedido?.vencimento ?? null,
          }
        })

        setInscricoes(lista)
      } catch {
        showError('Erro ao carregar inscrições.')
      } finally {
        setLoading(false)
      }

      if (user.role === 'coordenador') {
        fetch('/api/campos', {
          headers: getAuthHeaders(pb),
          credentials: 'include',
        }).catch(() => {})
      }
    }

    carregarInscricoes()
  }, [authChecked, tenantId, user, showError, pb])

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

      // 1. Buscar inscrição com expand do campo, produto e pedido
      const inscricaoRes = await fetch(
        `/api/inscricoes/${id}?expand=campo,produto,pedido`,
        { credentials: 'include' },
      )
      console.log(
        '[confirmarInscricao] Status inscricaoRes:',
        inscricaoRes.status,
      )
      const inscricao: InscricaoRecord & {
        expand?: {
          produto?: Produto | Produto[]
          pedido?: {
            status: 'pendente' | 'pago' | 'cancelado'
            link_pagamento?: string
          }
        }
      } = await inscricaoRes.json()
      console.log('[confirmarInscricao] inscricao:', inscricao)

      const pedidoExistente = inscricao.expand?.pedido
      if (pedidoExistente) {
        if (pedidoExistente.status === 'pago') {
          showSuccess('Pagamento já confirmado.')
          setConfirmandoId(null)
          return
        }
        if (pedidoExistente.status === 'pendente') {
          showSuccess('Link de pagamento enviado com sucesso!')
          setConfirmandoId(null)
          return
        }
      }

      // Identificar o produto associado à inscrição
      type InscricaoWithProduto = InscricaoRecord & {
        produto?: string | string[]
      }
      const rawProd =
        inscricao.produto || (inscricao as InscricaoWithProduto).produto
      const produtoId = Array.isArray(rawProd) ? rawProd[0] : rawProd
      console.log('[confirmarInscricao] produtoId:', produtoId)

      // Extrair produto do expand (array ou objeto)
      let produtoRecord: Produto | undefined = undefined

      // Se expand já trouxe produto (array ou objeto)
      if (inscricao.expand?.produto) {
        if (Array.isArray(inscricao.expand.produto)) {
          produtoRecord = inscricao.expand.produto.find(
            (p: Produto) => p.id === produtoId || p.id === inscricao.produto,
          )
          console.log(
            '[confirmarInscricao] produtoRecord (array):',
            produtoRecord,
          )
        } else if (typeof inscricao.expand.produto === 'object') {
          produtoRecord = inscricao.expand.produto as Produto
          console.log(
            '[confirmarInscricao] produtoRecord (obj):',
            produtoRecord,
          )
        }
      }

      // Fallback se não achou pelo expand
      if (!produtoRecord && produtoId) {
        try {
          const prodRes = await fetch(`/admin/api/produtos/${produtoId}`, {
            credentials: 'include',
          })
          console.log('[confirmarInscricao] Status prodRes:', prodRes.status)
          if (prodRes.ok) {
            produtoRecord = await prodRes.json()
            console.log(
              '[confirmarInscricao] produtoRecord (fallback):',
              produtoRecord,
            )
          }
        } catch (e) {
          console.error('[confirmarInscricao] Erro fetch produto:', e)
        }
      }

      // Log do produto final escolhido
      console.log('[confirmarInscricao] Produto final:', produtoRecord)

      // Se mesmo assim não encontrou, aborta!
      if (!produtoRecord || typeof produtoRecord.preco !== 'number') {
        showError(
          'Não foi possível identificar o produto ou o preço da inscrição.',
        )
        setConfirmandoId(null)
        console.log(
          '[confirmarInscricao] Produto/preço não encontrado, abortando!',
        )
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
        headers: { ...getAuthHeaders(pb), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_inscricao: id,
          valor: precoProduto,
          status: 'pendente',
          produto: [produtoRecord?.id || produtoId].filter(Boolean),
          cor: Array.isArray(produtoRecord.cores)
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
        headers: { ...getAuthHeaders(pb), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: pedido.pedidoId,
          valorBruto: precoProduto,
          paymentMethod: metodo,
          installments: parcelas,
        }),
      })
      const result = await asaasRes.json()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { url, vencimento } = result

      if (!asaasRes.ok || !url) {
        const msg =
          result?.message ||
          result?.error ||
          result?.errors?.[0]?.description ||
          'Tivemos um problema ao gerar seu link de pagamento. Por favor, entre em contato com a equipe.'
        console.error(
          '[confirmarInscricao] Erro ao gerar link de pagamento:',
          result,
        )
        try {
          await fetch(`/api/pedidos/${pedido.pedidoId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: getAuthHeaders(pb),
          })
        } catch (e) {
          console.error('[confirmarInscricao] Falha ao remover pedido:', e)
        }
        showError(msg)
        setConfirmandoId(null)
        return
      }

      // 4. Atualizar inscrição com o ID do pedido
      await fetch(`/api/inscricoes/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { ...getAuthHeaders(pb), 'Content-Type': 'application/json' },
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

      if (inscricao.criado_por) {
        const emailRes = await fetch('/api/email', {
          method: 'POST',
          headers: {
            ...getAuthHeaders(pb),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventType: 'confirmacao_inscricao',
            userId: inscricao.criado_por,
            paymentLink: url,
          }),
        })
        if (!emailRes.ok) {
          console.warn('Falha ao enviar e-mail', await emailRes.text())
        }
      }

      // 🔹 6. Enviar link de pagamento via WhatsApp
      const waRes = await fetch('/api/chats/message/sendPayment', {
        method: 'POST',
        headers: { ...getAuthHeaders(pb), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefone: inscricao.telefone,
          link: url,
        }),
      })
      if (!waRes.ok) {
        console.warn('Falha ao enviar WhatsApp', await waRes.text())
      }

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

  const exportarPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Relat\u00F3rio de Inscri\u00E7\u00F5es', doc.internal.pageSize.getWidth() / 2, 40, {
      align: 'center',
    })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const linhas = inscricoes.map((i) => [
      i.nome,
      i.telefone,
      i.evento,
      i.status,
      i.campo || '',
      formatDate(i.created),
    ])

    autoTable(doc, {
      startY: 60,
      head: [['Nome', 'Telefone', 'Evento', 'Status', 'Campo', 'Criado em']],
      body: linhas,
      theme: 'striped',
      headStyles: { fillColor: [217, 217, 217], halign: 'center' },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 },
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(10)
      doc.text(
        'Desenvolvido por M24 Tecnologia <m24saude.com.br>',
        40,
        pageHeight - 20,
      )
      doc.text(
        `P\u00E1gina ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() - 40,
        pageHeight - 20,
        { align: 'right' },
      )
    }

    doc.save('inscricoes.pdf')
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

  const inscricoesOrdenadas = [...inscricoesFiltradas].sort((a, b) => {
    if (ordenarPor === 'alfabetica') {
      const nomeA = a.nome.toLowerCase()
      const nomeB = b.nome.toLowerCase()
      return ordem === 'asc' ? nomeA.localeCompare(nomeB) : nomeB.localeCompare(nomeA)
    }
    const dataA = new Date(a.created || 0).getTime()
    const dataB = new Date(b.created || 0).getTime()
    return ordem === 'asc' ? dataA - dataB : dataB - dataA
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
        <select
          value={ordenarPor}
          onChange={(e) => setOrdenarPor(e.target.value as 'data' | 'alfabetica')}
          className="border rounded px-4 py-2 text-sm bg-white shadow-sm"
        >
          <option value="data">Data de criação</option>
          <option value="alfabetica">Ordem alfabética</option>
        </select>
        <button onClick={() => setOrdem(ordem === 'desc' ? 'asc' : 'desc')} className="btn btn-secondary">
          {ordem === 'desc' ? '↓' : '↑'}
        </button>
        <button
          onClick={exportarPDF}
          className="text-sm px-4 py-2 rounded btn btn-primary text-white transition"
        >
          Relat\u00F3rio PDF
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
                <th>Produto</th>
                <th>Criado em</th>
                <th>Confirmação</th>
                {role === 'coordenador' && <th>Ação</th>}
              </tr>
            </thead>
            <tbody>
              {inscricoesOrdenadas.map((i) => (
                <tr
                  key={i.id}
                  className={
                    i.pedido_status === 'pendente' &&
                    i.pedido_vencimento &&
                    new Date(i.pedido_vencimento) < new Date()
                      ? 'bg-red-50'
                      : undefined
                  }
                >
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
                      {i.pedido_status === 'pendente' &&
                      i.pedido_vencimento &&
                      new Date(i.pedido_vencimento) < new Date() ? (
                        <span className="ml-1 text-red-600">⚠️</span>
                      ) : null}
                    </span>
                  </td>
                  <td>{i.campo}</td>
                  <td>
                    {i.produtoNome || '—'}
                    {i.tamanho ? ` - ${i.tamanho}` : ''}
                  </td>
                  <td>{formatDate(i.created)}</td>
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
                              className={`p-2 rounded order-1 sm:order-none text-green-600 hover:text-green-700 cursor-pointer ${
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
                              className="p-2 rounded order-2 sm:order-none text-red-600 hover:text-red-700 cursor-pointer"
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

                      {role === 'coordenador' && (
                        <TooltipIcon label="Excluir">
                          <button
                            onClick={() => deletarInscricao(i.id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TooltipIcon>
                      )}

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

      {/* Paginação removida */}
    </main>
  )
}
