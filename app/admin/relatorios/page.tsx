'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useRef, useState } from 'react'
import type { Inscricao, Pedido, Produto } from '@/types'
import DashboardAnalytics from '../components/DashboardAnalytics'
import DashboardResumo from '../dashboard/components/DashboardResumo'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import { fetchAllPages } from '@/lib/utils/fetchAllPages'
import { formatDate } from '@/utils/formatDate'
import { getNomeCliente } from '@/utils/getNomeCliente'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  PDF_MARGINS,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_FOOTER,
} from '@/lib/report/constants'
import { CheckCircle, Download, FileText, Table } from 'lucide-react'

// Enhanced filtering interface
interface Filtros {
  status: string
  statusInscricoes: string
  produto: string
  campo: string
  periodo: string
  canal: string
}

const statusBadgeInscricoes = {
  pendente: 'bg-yellow-100 text-yellow-800',
  aguardando_pagamento: 'bg-blue-100 text-blue-800',
  confirmado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
} as const

const statusBadgePedidos = {
  pendente: 'bg-yellow-100 text-yellow-800',
  pago: 'bg-green-100 text-green-800',
  vencido: 'bg-red-200 text-red-800',
  cancelado: 'bg-red-100 text-red-800',
} as const

const PER_PAGE = 50

export default function RelatoriosPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [campos, setCampos] = useState<{ id: string; nome: string }[]>([])
  const [totalInscricoes, setTotalInscricoes] = useState(0)
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [filtroStatus, setFiltroStatus] = useState('pago')
  const [filtroInscricoes, setFiltroInscricoes] = useState('pendente')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  // View state
  const [activeView, setActiveView] = useState<'dashboard' | 'inscricoes' | 'pedidos'>('dashboard')

  // Table pagination and sorting
  const [paginaInscricoes, setPaginaInscricoes] = useState(1)
  const [paginaPedidos, setPaginaPedidos] = useState(1)
  const [totalPaginasInscricoes, setTotalPaginasInscricoes] = useState(1)
  const [totalPaginasPedidos, setTotalPaginasPedidos] = useState(1)
  const [ordenarPorInscricoes, setOrdenarPorInscricoes] = useState<'data' | 'alfabetica'>('data')
  const [ordenarPorPedidos, setOrdenarPorPedidos] = useState<'data' | 'alfabetica'>('data')
  const [ordemInscricoes, setOrdemInscricoes] = useState<'asc' | 'desc'>('desc')
  const [ordemPedidos, setOrdemPedidos] = useState<'asc' | 'desc'>('desc')

  // Search filters for tables
  const [buscaInscricoes, setBuscaInscricoes] = useState('')
  const [buscaPedidos, setBuscaPedidos] = useState('')

  // Enhanced filters state
  const [filtros, setFiltros] = useState<Filtros>({
    status: 'todos',
    statusInscricoes: 'todos',
    produto: 'todos',
    campo: 'todos',
    periodo: 'todos',
    canal: 'todos'
  })

  // Filtered data based on active filters
  const [inscricoesFiltradas, setInscricoesFiltradas] = useState<Inscricao[]>([])
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([])

  // Apply filters to data
  useEffect(() => {
    let inscricoesResult = [...inscricoes]
    let pedidosResult = [...pedidos]

    // Filter inscricoes
    if (filtros.statusInscricoes !== 'todos') {
      inscricoesResult = inscricoesResult.filter(i => i.status === filtros.statusInscricoes)
    }
    if (filtros.produto !== 'todos') {
      inscricoesResult = inscricoesResult.filter(i => i.produto === filtros.produto)
    }
    if (filtros.campo !== 'todos') {
      inscricoesResult = inscricoesResult.filter(i => i.campo === filtros.campo)
    }
    if (filtros.periodo !== 'todos') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filtros.periodo) {
        case 'ultima_semana':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'ultimo_mes':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'ultimos_3_meses':
          filterDate.setMonth(now.getMonth() - 3)
          break
        case 'ultimo_ano':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      if (filtros.periodo !== 'todos') {
        inscricoesResult = inscricoesResult.filter(i => 
          i.created && new Date(i.created) >= filterDate
        )
      }
    }

    // Apply search filter for inscricoes
    if (buscaInscricoes) {
      const busca = buscaInscricoes.toLowerCase()
      inscricoesResult = inscricoesResult.filter(i =>
        i.nome.toLowerCase().includes(busca) ||
        i.telefone?.toLowerCase().includes(busca) ||
        i.cpf?.toLowerCase().includes(busca) ||
        (user?.role === 'coordenador' && i.expand?.campo?.nome?.toLowerCase().includes(busca))
      )
    }

    // Filter pedidos
    if (filtros.status !== 'todos') {
      pedidosResult = pedidosResult.filter(p => p.status === filtros.status)
    }
    if (filtros.produto !== 'todos') {
      pedidosResult = pedidosResult.filter(p => {
        if (Array.isArray(p.produto)) {
          return p.produto.includes(filtros.produto)
        }
        // Check expanded produto
        if (p.expand?.produto) {
          if (Array.isArray(p.expand.produto)) {
            return p.expand.produto.some((prod: Produto) => prod.id === filtros.produto)
          } else {
            return p.expand.produto.id === filtros.produto
          }
        }
        return false
      })
    }
    if (filtros.campo !== 'todos') {
      pedidosResult = pedidosResult.filter(p => p.campo === filtros.campo)
    }
    if (filtros.canal !== 'todos') {
      pedidosResult = pedidosResult.filter(p => p.canal === filtros.canal)
    }
    if (filtros.periodo !== 'todos') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filtros.periodo) {
        case 'ultima_semana':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'ultimo_mes':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'ultimos_3_meses':
          filterDate.setMonth(now.getMonth() - 3)
          break
        case 'ultimo_ano':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      if (filtros.periodo !== 'todos') {
        pedidosResult = pedidosResult.filter(p => 
          p.created && new Date(p.created) >= filterDate
        )
      }
    }

    // Apply search filter for pedidos
    if (buscaPedidos) {
      const busca = buscaPedidos.toLowerCase()
      pedidosResult = pedidosResult.filter(p => {
        const produtoStr = Array.isArray(p.expand?.produto)
          ? p.expand.produto.map((prod: Produto) => prod.nome).join(', ')
          : (p.expand?.produto as Produto | undefined)?.nome ||
            (Array.isArray(p.produto) ? p.produto.join(', ') : (p.produto ?? ''))
        
        return produtoStr.toLowerCase().includes(busca) ||
               p.email.toLowerCase().includes(busca) ||
               p.expand?.campo?.nome?.toLowerCase().includes(busca) ||
               getNomeCliente(p).toLowerCase().includes(busca)
      })
    }

    setInscricoesFiltradas(inscricoesResult)
    setPedidosFiltrados(pedidosResult)
  }, [inscricoes, pedidos, filtros, buscaInscricoes, buscaPedidos, user?.role])

  // Update pagination when filtered data changes
  useEffect(() => {
    setTotalPaginasInscricoes(Math.ceil(inscricoesFiltradas.length / PER_PAGE) || 1)
    setTotalPaginasPedidos(Math.ceil(pedidosFiltrados.length / PER_PAGE) || 1)
  }, [inscricoesFiltradas, pedidosFiltrados])

  // Sort inscricoes
  const inscricoesOrdenadas = [...inscricoesFiltradas].sort((a, b) => {
    if (ordenarPorInscricoes === 'alfabetica') {
      const nomeA = a.nome.toLowerCase()
      const nomeB = b.nome.toLowerCase()
      return ordemInscricoes === 'asc'
        ? nomeA.localeCompare(nomeB)
        : nomeB.localeCompare(nomeA)
    }
    const dataA = new Date(a.created || 0).getTime()
    const dataB = new Date(b.created || 0).getTime()
    return ordemInscricoes === 'asc' ? dataA - dataB : dataB - dataA
  })

  // Sort pedidos
  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    if (ordenarPorPedidos === 'alfabetica') {
      const nomeA = getNomeCliente(a).toLowerCase()
      const nomeB = getNomeCliente(b).toLowerCase()
      return ordemPedidos === 'asc'
        ? nomeA.localeCompare(nomeB)
        : nomeB.localeCompare(nomeA)
    }
    const dataA = new Date(a.created || 0).getTime()
    const dataB = new Date(b.created || 0).getTime()
    return ordemPedidos === 'asc' ? dataA - dataB : dataB - dataA
  })

  // Paginated data
  const inscricoesPaginadas = inscricoesOrdenadas.slice(
    (paginaInscricoes - 1) * PER_PAGE,
    paginaInscricoes * PER_PAGE
  )

  const pedidosPaginados = pedidosOrdenados.slice(
    (paginaPedidos - 1) * PER_PAGE,
    paginaPedidos * PER_PAGE
  )

  useEffect(() => {
    if (!authChecked || !user?.id || !user?.role) return
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        setError(null)
        const userRes = await fetch(`/admin/api/usuarios/${user.id}`, {
          credentials: 'include',
          signal,
        })
        if (!userRes.ok) {
          if (userRes.status === 401 || userRes.status === 403) {
            setError('403 - Acesso negado')
            return
          }
          throw new Error('Erro ao obter usuário')
        }
        const expandedUser = await userRes.json()

        const perPage = 50
        const filtroCliente = `cliente='${user.cliente}'`
        const params = new URLSearchParams({
          page: '1',
          perPage: String(perPage),
          filter: filtroCliente,
        })

        // Fetch inscricoes
        const insRes = await fetch(`/api/inscricoes?${params.toString()}`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const insRest = await fetchAllPages<
          { items?: Inscricao[] } | Inscricao
        >(
          `/api/inscricoes?${params.toString()}`,
          insRes.totalPages ?? 1,
          signal,
        )
        let rawInscricoes = Array.isArray(insRes.items) ? insRes.items : insRes
        rawInscricoes = rawInscricoes.concat(
          insRest.flatMap((r) =>
            Array.isArray((r as { items?: Inscricao[] }).items)
              ? (r as { items: Inscricao[] }).items
              : (r as Inscricao),
          ),
        )

        // Fetch pedidos
        params.set('page', '1')
        const pedRes = await fetch(
          `/api/pedidos?${params.toString()}&expand=campo,produto`,
          {
            credentials: 'include',
            signal,
          },
        ).then((r) => r.json())
        const pedRest = await fetchAllPages<{ items?: Pedido[] } | Pedido>(
          `/api/pedidos?${params.toString()}&expand=campo,produto`,
          pedRes.totalPages ?? 1,
          signal,
        )
        let rawPedidos = Array.isArray(pedRes.items) ? pedRes.items : pedRes
        rawPedidos = rawPedidos.concat(
          pedRest.flatMap((r) =>
            Array.isArray((r as { items?: Pedido[] }).items)
              ? (r as { items: Pedido[] }).items
              : (r as Pedido),
          ),
        )

        // Fetch produtos for filter options
        const prodRes = await fetch(`/api/produtos?${params.toString()}`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const produtos = Array.isArray(prodRes.items) ? prodRes.items : prodRes

        // Fetch campos for filter options
        const camposRes = await fetch(`/api/campos?${params.toString()}`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const campos = Array.isArray(camposRes.items) ? camposRes.items : camposRes

        setTotalInscricoes(rawInscricoes.length)
        setTotalPedidos(rawPedidos.length)

        if (!isMounted.current) return

        const campoId = expandedUser.expand?.campo?.id

        const allInscricoes: Inscricao[] = rawInscricoes.map(
          (r: Inscricao) => ({
            id: r.id,
            nome: r.nome,
            telefone: r.telefone,
            evento: r.expand?.evento?.titulo,
            status: r.status,
            created: r.created,
            campo: r.campo,
            tamanho: r.tamanho,
            produto: r.produto,
            genero: r.genero,
            data_nascimento: r.data_nascimento,
            criado_por: r.criado_por,
            cpf: r.cpf,
            expand: {
              campo: r.expand?.campo,
              criado_por: r.expand?.criado_por,
              pedido: r.expand?.pedido,
              produto: r.expand?.produto,
            },
          }),
        )

        const allPedidos: Pedido[] = rawPedidos.map((r: Pedido) => ({
          id: r.id,
          id_inscricao: r.id_inscricao,
          produto: r.produto,
          email: r.email,
          tamanho: r.tamanho,
          cor: r.cor,
          status: r.status,
          valor: r.valor,
          id_pagamento: r.id_pagamento,
          created: r.created,
          campo: r.campo,
          genero: r.genero,
          evento: r.expand?.evento?.titulo,
          data_nascimento: r.data_nascimento,
          responsavel: r.responsavel,
          canal: r.canal,
          expand: {
            campo: r.expand?.campo,
            criado_por: r.expand?.criado_por,
            produto: r.expand?.produto,
            id_inscricao: r.expand?.id_inscricao,
          },
        }))

        if (user.role === 'coordenador') {
          setInscricoes(allInscricoes)
          setPedidos(allPedidos)
          setProdutos(produtos)
          setCampos(campos)
        } else {
          setInscricoes(allInscricoes.filter((i) => i.campo === campoId))
          setPedidos(allPedidos.filter((p) => p.expand?.campo?.id === campoId))
          setProdutos(produtos)
          setCampos(campos.filter((c: { id: string }) => c.id === campoId))
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Erro no relatório:', err.message)
        }
        setError('Erro ao carregar relatório.')
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted.current = false
      controller.abort()
    }
  }, [authChecked, user?.id, user?.role, user?.cliente])

  const handleFiltroChange = (key: keyof Filtros, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearAllFilters = () => {
    setFiltros({
      status: 'todos',
      statusInscricoes: 'todos',
      produto: 'todos',
      campo: 'todos',
      periodo: 'todos',
      canal: 'todos'
    })
    setBuscaInscricoes('')
    setBuscaPedidos('')
  }

  const exportarInscricoesPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFontSize(FONT_SIZE_TITLE)
    doc.setFont('helvetica', 'bold')
    doc.text(
      'Relatório de Inscrições',
      doc.internal.pageSize.getWidth() / 2,
      PDF_MARGINS.top,
      { align: 'center' }
    )
    doc.setFontSize(FONT_SIZE_BODY)
    doc.setFont('helvetica', 'normal')

    const linhas = inscricoesFiltradas.map((i) => [
      i.nome,
      i.telefone,
      i.expand?.evento?.titulo || '',
      i.status,
      i.expand?.campo?.nome || '',
      formatDate(i.created),
    ])

    autoTable(doc, {
      startY: PDF_MARGINS.top + 20,
      head: [['Nome', 'Telefone', 'Evento', 'Status', 'Campo', 'Criado em']],
      body: linhas,
      theme: 'striped',
      headStyles: { fillColor: [217, 217, 217], halign: 'center' },
      styles: { fontSize: 8 },
      margin: PDF_MARGINS,
    })

    const dataHora = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    })
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(FONT_SIZE_FOOTER)
      doc.text('Desenvolvido por M24 Tecnologia', PDF_MARGINS.left, pageHeight - 20)
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        pageHeight - 20,
        { align: 'center' }
      )
      doc.text(
        dataHora,
        doc.internal.pageSize.getWidth() - PDF_MARGINS.right,
        pageHeight - 20,
        { align: 'right' }
      )
    }

    doc.save('relatorio_inscricoes.pdf')
  }

  const exportarPedidosPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFontSize(FONT_SIZE_TITLE)
    doc.setFont('helvetica', 'bold')
    doc.text(
      'Relatório de Pedidos',
      doc.internal.pageSize.getWidth() / 2,
      PDF_MARGINS.top,
      { align: 'center' }
    )
    doc.setFontSize(FONT_SIZE_BODY)
    doc.setFont('helvetica', 'normal')

    const linhas = pedidosFiltrados.map((p) => [
      Array.isArray(p.expand?.produto)
        ? p.expand.produto.map((prod: Produto) => prod.nome).join(', ')
        : (p.expand?.produto as Produto | undefined)?.nome ||
          (Array.isArray(p.produto) ? p.produto.join(', ') : p.produto),
      getNomeCliente(p),
      p.email,
      p.tamanho || '',
      p.status,
      p.expand?.campo?.nome || '',
      p.canal || '',
      formatDate(p.created),
    ])

    autoTable(doc, {
      startY: PDF_MARGINS.top + 20,
      head: [['Produto', 'Nome', 'Email', 'Tamanho', 'Status', 'Campo', 'Canal', 'Data']],
      body: linhas,
      theme: 'striped',
      headStyles: { fillColor: [217, 217, 217], halign: 'center' },
      styles: { fontSize: 8 },
      margin: PDF_MARGINS,
    })

    const dataHora = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    })
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(FONT_SIZE_FOOTER)
      doc.text('Desenvolvido por M24 Tecnologia', PDF_MARGINS.left, pageHeight - 20)
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        pageHeight - 20,
        { align: 'center' }
      )
      doc.text(
        dataHora,
        doc.internal.pageSize.getWidth() - PDF_MARGINS.right,
        pageHeight - 20,
        { align: 'right' }
      )
    }

    doc.save('relatorio_pedidos.pdf')
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      {!authChecked || !user || loading ? (
        <LoadingOverlay show={true} text="Carregando relatório..." />
      ) : error ? (
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-2xl font-semibold">{error}</h1>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center dark:text-gray-100">
            <h1 className="heading">Relatório Geral</h1>
            <p className="text-sm text-gray-700 mt-1 dark:text-gray-100">
              Exporte o resumo e métricas gerais em PDF ou XLSX.
            </p>
          </div>

          {/* View Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'dashboard'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('inscricoes')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'inscricoes'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Table className="w-4 h-4 inline mr-1" />
                  Inscrições ({inscricoesFiltradas.length})
                </button>
                <button
                  onClick={() => setActiveView('pedidos')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'pedidos'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Table className="w-4 h-4 inline mr-1" />
                  Pedidos ({pedidosFiltrados.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className="card mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Filtros Avançados</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Status do Pedido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Situação do Pedido
                  </label>
                  <select
                    value={filtros.status}
                    onChange={(e) => handleFiltroChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todas as situações</option>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="vencido">Vencido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                {/* Status da Inscrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Situação da Inscrição
                  </label>
                  <select
                    value={filtros.statusInscricoes}
                    onChange={(e) => handleFiltroChange('statusInscricoes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todas as situações</option>
                    <option value="pendente">Pendente</option>
                    <option value="aguardando_pagamento">Aguardando Pagamento</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                {/* Produto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Produto
                  </label>
                  <select
                    value={filtros.produto}
                    onChange={(e) => handleFiltroChange('produto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todos os produtos</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campo
                  </label>
                  <select
                    value={filtros.campo}
                    onChange={(e) => handleFiltroChange('campo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todos os campos</option>
                    {campos.map((campo) => (
                      <option key={campo.id} value={campo.id}>
                        {campo.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Canal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Canal de Venda
                  </label>
                  <select
                    value={filtros.canal}
                    onChange={(e) => handleFiltroChange('canal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todos os canais</option>
                    <option value="loja">Loja</option>
                    <option value="inscricao">Inscrição</option>
                  </select>
                </div>

                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período
                  </label>
                  <select
                    value={filtros.periodo}
                    onChange={(e) => handleFiltroChange('periodo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todo o período</option>
                    <option value="ultima_semana">Última semana</option>
                    <option value="ultimo_mes">Último mês</option>
                    <option value="ultimos_3_meses">Últimos 3 meses</option>
                    <option value="ultimo_ano">Último ano</option>
                  </select>
                </div>
              </div>

              {/* Filter actions */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {inscricoesFiltradas.length} inscrições e {pedidosFiltrados.length} pedidos
                </div>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Content based on active view */}
          {activeView === 'dashboard' && (
            <>
              <DashboardResumo
                inscricoes={inscricoesFiltradas}
                pedidos={pedidosFiltrados}
                filtroStatus={filtroStatus}
                filtroInscricoes={filtroInscricoes}
                setFiltroInscricoes={setFiltroInscricoes}
                setFiltroStatus={setFiltroStatus}
                totalInscricoes={totalInscricoes}
                totalPedidos={totalPedidos}
              />
              <DashboardAnalytics inscricoes={inscricoesFiltradas} pedidos={pedidosFiltrados} />
            </>
          )}

          {/* Inscricoes Table View */}
          {activeView === 'inscricoes' && (
            <div className="space-y-6">
              {/* Table Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <input
                  type="text"
                  placeholder={user?.role === 'coordenador' 
                    ? 'Buscar por nome, telefone, CPF ou campo'
                    : 'Buscar por nome, telefone ou CPF'
                  }
                  value={buscaInscricoes}
                  onChange={(e) => {
                    setBuscaInscricoes(e.target.value)
                    setPaginaInscricoes(1)
                  }}
                  className="flex-1 md:flex-none border rounded px-4 py-2 text-sm w-full md:w-64 shadow-sm"
                />
                <select
                  value={ordenarPorInscricoes}
                  onChange={(e) => setOrdenarPorInscricoes(e.target.value as 'data' | 'alfabetica')}
                  className="border rounded px-4 py-2 text-sm bg-white shadow-sm"
                >
                  <option value="data">Data de criação</option>
                  <option value="alfabetica">Ordem alfabética</option>
                </select>
                <button
                  onClick={() => setOrdemInscricoes(ordemInscricoes === 'desc' ? 'asc' : 'desc')}
                  className="btn btn-secondary"
                >
                  {ordemInscricoes === 'desc' ? '↓' : '↑'}
                </button>
                <button
                  onClick={exportarInscricoesPDF}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
              </div>

              {/* Inscricoes Table */}
              {inscricoesFiltradas.length === 0 ? (
                <p className="text-center text-gray-500">Nenhuma inscrição encontrada.</p>
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
                      </tr>
                    </thead>
                    <tbody>
                      {inscricoesPaginadas.map((i) => (
                        <tr key={i.id}>
                          <td className="font-medium">{i.nome}</td>
                          <td>{i.telefone}</td>
                          <td>{i.expand?.evento?.titulo || '—'}</td>
                          <td className="capitalize">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                statusBadgeInscricoes[i.status as keyof typeof statusBadgeInscricoes] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {i.status}
                            </span>
                          </td>
                          <td>{i.expand?.campo?.nome || '—'}</td>
                          <td>
                            {i.expand?.produto?.nome || '—'}
                            {i.tamanho ? ` - ${i.tamanho}` : ''}
                          </td>
                          <td>{formatDate(i.created)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Inscricoes */}
              {inscricoesFiltradas.length > 0 && (
                <div className="flex justify-between items-center mt-6 text-sm">
                  <button
                    disabled={paginaInscricoes === 1}
                    onClick={() => setPaginaInscricoes(p => Math.max(1, p - 1))}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span>
                    Página {paginaInscricoes} de {totalPaginasInscricoes}
                  </span>
                  <button
                    disabled={paginaInscricoes === totalPaginasInscricoes}
                    onClick={() => setPaginaInscricoes(p => Math.min(totalPaginasInscricoes, p + 1))}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pedidos Table View */}
          {activeView === 'pedidos' && (
            <div className="space-y-6">
              {/* Table Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <input
                  type="text"
                  placeholder={user?.role === 'coordenador'
                    ? 'Buscar por produto, email, nome ou campo'
                    : 'Buscar por nome ou email'
                  }
                  value={buscaPedidos}
                  onChange={(e) => {
                    setBuscaPedidos(e.target.value)
                    setPaginaPedidos(1)
                  }}
                  className="flex-1 md:flex-none border rounded px-4 py-2 text-sm w-full md:w-64 shadow-sm"
                />
                <select
                  value={ordenarPorPedidos}
                  onChange={(e) => setOrdenarPorPedidos(e.target.value as 'data' | 'alfabetica')}
                  className="border rounded px-4 py-2 text-sm bg-white shadow-sm"
                >
                  <option value="data">Data de criação</option>
                  <option value="alfabetica">Ordem alfabética</option>
                </select>
                <button
                  onClick={() => setOrdemPedidos(ordemPedidos === 'desc' ? 'asc' : 'desc')}
                  className="btn btn-secondary"
                >
                  {ordemPedidos === 'desc' ? '↓' : '↑'}
                </button>
                <button
                  onClick={exportarPedidosPDF}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
              </div>

              {/* Pedidos Table */}
              {pedidosFiltrados.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum pedido encontrado.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Tamanho</th>
                        <th>Status</th>
                        <th>Campo</th>
                        <th>Canal</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosPaginados.map((pedido) => (
                        <tr key={pedido.id}>
                          <td className="font-medium">
                            {Array.isArray(pedido.expand?.produto)
                              ? pedido.expand?.produto
                                  .map((p: Produto) => p.nome)
                                  .join(', ')
                              : (pedido.expand?.produto as Produto | undefined)?.nome ||
                                (Array.isArray(pedido.produto)
                                  ? pedido.produto.join(', ')
                                  : pedido.produto)}
                          </td>
                          <td>{getNomeCliente(pedido) || '—'}</td>
                          <td>{pedido.email}</td>
                          <td>{pedido.tamanho || '—'}</td>
                          <td className="capitalize">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                statusBadgePedidos[pedido.status as keyof typeof statusBadgePedidos]
                              }`}
                            >
                              {pedido.status}
                            </span>
                            {(pedido.status === 'pendente' || pedido.status === 'vencido') &&
                            pedido.vencimento &&
                            new Date(pedido.vencimento) < new Date() ? (
                              <span className="ml-1 text-red-600">⚠️</span>
                            ) : null}
                          </td>
                          <td>{pedido.expand?.campo?.nome || '—'}</td>
                          <td className="text-xs font-medium">
                            {pedido.canal
                              ? pedido.canal.charAt(0).toUpperCase() +
                                pedido.canal.slice(1).toLowerCase()
                              : '—'}
                          </td>
                          <td>{formatDate(pedido.created)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Pedidos */}
              {pedidosFiltrados.length > 0 && (
                <div className="flex justify-between items-center mt-6 text-sm">
                  <button
                    disabled={paginaPedidos === 1}
                    onClick={() => setPaginaPedidos(p => Math.max(1, p - 1))}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span>
                    Página {paginaPedidos} de {totalPaginasPedidos}
                  </span>
                  <button
                    disabled={paginaPedidos === totalPaginasPedidos}
                    onClick={() => setPaginaPedidos(p => Math.min(totalPaginasPedidos, p + 1))}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}
