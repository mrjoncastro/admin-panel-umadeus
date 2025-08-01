'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useState, useRef, useCallback } from 'react'
import type { Inscricao, Pedido, Produto } from '@/types'
import { fetchAllPages } from '@/lib/utils/fetchAllPages'
import dynamic from 'next/dynamic'
import { setupCharts } from '@/lib/chartSetup'
import { createPattern, PatternType } from '@/utils/chartPatterns'
import type { Chart, ChartData } from 'chart.js'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import DashboardResumo from '../dashboard/components/DashboardResumo'
import { exportToExcelLikePDF } from '@/lib/utils/excelExport'
import { generatePDF } from '@/lib/services/pdfGenerator'

const BarChart = dynamic(() => import('react-chartjs-2').then((m) => m.Bar), {
  ssr: false,
})

// Enhanced filtering interface
interface Filtros {
  produto: string[]
  campo: string[]
  periodo: string
  canal: string[]
  tamanho: string[]
  evento: string
}

export default function RelatoriosPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [campos, setCampos] = useState<{ id: string; nome: string }[]>([])
  const [eventos, setEventos] = useState<{ id: string; titulo: string }[]>([])

  // Enhanced filters state
  const [filtros, setFiltros] = useState<Filtros>({
    produto: [],
    campo: [],
    periodo: 'todos',
    canal: [],
    tamanho: [],
    evento: 'todos',
  })

  // Filtered data based on active filters
  const [inscricoesFiltradas, setInscricoesFiltradas] = useState<Inscricao[]>(
    [],
  )
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([])

  // Chart data for the unified report
  const [chartData, setChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  })
  const chartRef = useRef<Chart<'bar'> | null>(null)

  // Dropdown state
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExportDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Apply filters to data
  useEffect(() => {
    let inscricoesResult = [...inscricoes]
    let pedidosResult = [...pedidos]

    // FILTRO POR EVENTO - Isolamento crítico para evitar mistura de dados
    if (filtros.evento !== 'todos') {
      // Filtrar inscrições por evento (através do produto associado)
      inscricoesResult = inscricoesResult.filter((i) => {
        if (!i.produto) return false

        // Verificar se o produto da inscrição pertence ao evento selecionado
        const produtoInscricao = produtos.find((p) => p.id === i.produto)
        return produtoInscricao?.evento_id === filtros.evento
      })

      // Filtrar pedidos por evento (através do produto associado)
      pedidosResult = pedidosResult.filter((p) => {
        // p.produto é sempre string[] no tipo Pedido
        return p.produto.some((prodId) => {
          const produto = produtos.find((prod) => prod.id === prodId)
          return produto?.evento_id === filtros.evento
        })
      })
    }

    if (filtros.produto.length > 0) {
      inscricoesResult = inscricoesResult.filter(
        (i) => i.produto && filtros.produto.includes(i.produto),
      )
    }
    if (filtros.campo.length > 0) {
      inscricoesResult = inscricoesResult.filter(
        (i) => i.campo && filtros.campo.includes(i.campo),
      )
    }
    if (filtros.tamanho.length > 0) {
      inscricoesResult = inscricoesResult.filter(
        (i) => i.tamanho && filtros.tamanho.includes(i.tamanho),
      )
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
        inscricoesResult = inscricoesResult.filter(
          (i) => i.created && new Date(i.created) >= filterDate,
        )
      }
    }

    if (filtros.produto.length > 0) {
      pedidosResult = pedidosResult.filter((p) => {
        if (Array.isArray(p.produto)) {
          return p.produto.some((prod) => filtros.produto.includes(prod))
        }
        // Check expanded produto
        if (p.expand?.produto) {
          if (Array.isArray(p.expand.produto)) {
            return p.expand.produto.some((prod: Produto) =>
              filtros.produto.includes(prod.id),
            )
          } else {
            return filtros.produto.includes(p.expand.produto.id)
          }
        }
        return false
      })
    }
    if (filtros.campo.length > 0) {
      pedidosResult = pedidosResult.filter(
        (p) => p.campo && filtros.campo.includes(p.campo),
      )
    }
    if (filtros.tamanho.length > 0) {
      pedidosResult = pedidosResult.filter(
        (p) => p.tamanho && filtros.tamanho.includes(p.tamanho),
      )
    }
    if (filtros.canal.length > 0) {
      pedidosResult = pedidosResult.filter(
        (p) => p.canal && filtros.canal.includes(p.canal),
      )
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
        pedidosResult = pedidosResult.filter(
          (p) => p.created && new Date(p.created) >= filterDate,
        )
      }
    }

    setInscricoesFiltradas(inscricoesResult)
    setPedidosFiltrados(pedidosResult)
  }, [inscricoes, pedidos, filtros, produtos])

  const sortPedidos = useCallback((lista: Pedido[]) => {
    return [...lista].sort((a, b) => {
      const campoA = a.expand?.campo?.nome || ''
      const campoB = b.expand?.campo?.nome || ''
      return campoA.localeCompare(campoB)
    })
  }, [])

  // Generate chart data from filtered pedidos
  useEffect(() => {
    const ordered = sortPedidos(pedidosFiltrados)
    const rowsCalc: (string | number)[][] = []
    const totalsCalc: Record<string, number> = {}
    let labels: string[] = []
    let datasets: ChartData<'bar'>['datasets'] = []

    // Simple produtoCampo analysis
    const count: Record<string, Record<string, number>> = {}
    ordered.forEach((p) => {
      const campo = p.expand?.campo?.nome || 'Sem campo'
      const produtosData = Array.isArray(p.expand?.produto)
        ? (p.expand?.produto as Produto[])
        : p.expand?.produto
          ? [p.expand.produto as Produto]
          : []
      if (produtosData.length === 0) {
        count[campo] = count[campo] || {}
        count[campo]['Sem produto'] = (count[campo]['Sem produto'] || 0) + 1
        totalsCalc['Sem produto'] = (totalsCalc['Sem produto'] || 0) + 1
      } else {
        produtosData.forEach((pr: Produto) => {
          const nome = pr?.nome || 'Sem produto'
          count[campo] = count[campo] || {}
          count[campo][nome] = (count[campo][nome] || 0) + 1
          totalsCalc[nome] = (totalsCalc[nome] || 0) + 1
        })
      }
    })
    labels = Object.keys(count)
    const produtos = Array.from(
      new Set(labels.flatMap((c) => Object.keys(count[c]))),
    )
    const patterns: PatternType[] = [
      'diagonal',
      'dots',
      'cross',
      'reverseDiagonal',
    ]
    datasets = produtos.map((prod, idx) => {
      labels.forEach((campo) => {
        const total = count[campo][prod]
        if (total !== undefined) rowsCalc.push([campo, prod, total])
      })
      return {
        label: prod,
        data: labels.map((c) => count[c][prod] || 0),
        backgroundColor: createPattern(patterns[idx % patterns.length], '#666'),
        borderColor: '#000',
        stack: 'stack',
      }
    })

    setChartData({ labels, datasets })
  }, [pedidosFiltrados, sortPedidos])

  useEffect(() => {
    setupCharts()
  }, [])

  useEffect(() => {
    if (!authChecked || !user?.id || !user?.role) return
    const controller = new AbortController()
    const signal = controller.signal
    const isMounted = { current: true }

    const fetchData = async () => {
      try {
        setError(null)
        let expandedUser: { expand?: { campo?: { id?: string } } } | null = null

        if (user.role !== 'lider') {
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
          expandedUser = await userRes.json()
        }

        const perPage = 50
        const filtroCliente = `cliente='${user.cliente}'`
        const params = new URLSearchParams({
          page: '1',
          perPage: String(perPage),
          filter: filtroCliente,
        })

        // Fetch inscricoes com campos expandidos
        const insRes = await fetch(
          `/api/inscricoes?${params.toString()}&expand=produto,evento,campo`,
          {
            credentials: 'include',
            signal,
          },
        ).then((r) => r.json())
        const insRest = await fetchAllPages<
          { items?: Inscricao[] } | Inscricao
        >(
          `/api/inscricoes?${params.toString()}&expand=produto,evento,campo`,
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
          `/api/pedidos?${params.toString()}&expand=campo,produto,id_inscricao,responsavel`,
          {
            credentials: 'include',
            signal,
          },
        ).then((r) => r.json())
        const pedRest = await fetchAllPages<{ items?: Pedido[] } | Pedido>(
          `/api/pedidos?${params.toString()}&expand=campo,produto,id_inscricao,responsavel`,
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
        const prodRes = await fetch(`/api/produtos`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const produtos = Array.isArray(prodRes) ? prodRes : [prodRes]

        // Não filtrar por ativo, usar todos os produtos
        console.log('Produtos carregados:', produtos) // Debug log

        // Fetch campos for filter options
        const camposRes = await fetch(`/api/campos?${params.toString()}`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const campos = Array.isArray(camposRes.items)
          ? camposRes.items
          : camposRes

        // Fetch eventos para o filtro
        const eventosRes = await fetch(`/api/eventos?${params.toString()}`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const eventos = Array.isArray(eventosRes.items)
          ? eventosRes.items
          : eventosRes
        setEventos(eventos)
        console.log('Eventos carregados:', eventos)

        if (!isMounted.current) return

        const campoId = expandedUser?.expand?.campo?.id || user.campo

        const allInscricoes: Inscricao[] = rawInscricoes.map(
          (r: Inscricao) => ({
            id: r.id,
            nome: r.nome,
            telefone: r.telefone,
            cpf: r.cpf,
            evento: r.expand?.evento?.titulo,
            status: r.status,
            created: r.created,
            campo: r.campo,
            tamanho: r.tamanho,
            produto: r.produto,
            genero: r.genero,
            data_nascimento: r.data_nascimento,
            criado_por: r.criado_por,
            expand: {
              campo: r.expand?.campo,
              criado_por: r.expand?.criado_por,
              pedido: r.expand?.pedido,
              produto: r.expand?.produto,
              evento: r.expand?.evento,
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
            responsavel: r.expand?.responsavel,
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
  }, [authChecked, user?.id, user?.role, user?.cliente, user?.campo])

  const handleFiltroChange = (key: keyof Filtros, value: string) => {
    setFiltros((prev) => {
      if (key === 'periodo' || key === 'evento') {
        return {
          ...prev,
          [key]: value,
        }
      }

      const currentArray = prev[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]

      return {
        ...prev,
        [key]: newArray,
      }
    })
  }

  const clearAllFilters = () => {
    setFiltros({
      produto: [],
      campo: [],
      periodo: 'todos',
      canal: [],
      tamanho: [],
      evento: 'todos',
    })
  }

  // Funções para calcular opções dinâmicas baseadas nos filtros ativos

  const getProdutoOptions = () => {
    // Retornar produtos filtrados por evento para evitar mistura de dados
    return produtosFiltrados
  }

  const getCampoOptions = () => {
    const camposDisponiveis = new Set<string>()
    const pedidosComCampos = [...pedidosFiltrados, ...inscricoesFiltradas]

    pedidosComCampos.forEach((item) => {
      if (item.campo) camposDisponiveis.add(item.campo)
      if ('expand' in item && item.expand?.campo?.id) {
        camposDisponiveis.add(item.expand.campo.id)
      }
    })

    return campos.filter(
      (campo) =>
        camposDisponiveis.has(campo.id) || filtros.campo.includes(campo.id),
    )
  }

  const getCanalOptions = () => {
    const canaisDisponiveis = new Set<string>()
    pedidosFiltrados.forEach((p) => {
      if (p.canal) canaisDisponiveis.add(p.canal)
    })

    return [
      { value: 'loja', label: 'Loja' },
      { value: 'inscricao', label: 'Inscrição' },
    ].filter(
      (canal) =>
        canaisDisponiveis.has(canal.value) ||
        filtros.canal.includes(canal.value),
    )
  }

  const getTamanhoOptions = () => {
    const tamanhosDisponiveis = new Set<string>()
    const pedidosComTamanhos = [...pedidosFiltrados, ...inscricoesFiltradas]

    pedidosComTamanhos.forEach((item) => {
      if (item.tamanho) tamanhosDisponiveis.add(item.tamanho)
    })

    return ['PP', 'P', 'M', 'G', 'GG'].filter(
      (tamanho) =>
        tamanhosDisponiveis.has(tamanho) || filtros.tamanho.includes(tamanho),
    )
  }

  // Funções de exportação
  const handleExportExcel = async () => {
    if (isExporting) return

    setIsExporting(true)
    try {
      const valorTotal = pedidosFiltrados
        .filter((p) => p.status === 'pago')
        .reduce((acc, p) => acc + Number(p.valor || 0), 0)

      const exportData = {
        inscricoes: inscricoesFiltradas,
        pedidos: pedidosFiltrados,
        produtos,
        totalInscricoes: inscricoesFiltradas.length,
        totalPedidos: pedidosFiltrados.length,
        valorTotal,
      }
      await exportToExcelLikePDF(exportData)
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
    } finally {
      setIsExporting(false)
      setIsExportDropdownOpen(false)
    }
  }

  const handleExportPDF = async () => {
    if (isExporting) return

    setIsExporting(true)
    try {
      const valorTotal = pedidosFiltrados
        .filter((p) => p.status === 'pago')
        .reduce((acc, p) => acc + Number(p.valor || 0), 0)

      await generatePDF(
        inscricoesFiltradas,
        pedidosFiltrados,
        produtos,
        valorTotal,
      )
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setIsExporting(false)
      setIsExportDropdownOpen(false)
    }
  }

  const produtosFiltrados =
    filtros.evento !== 'todos'
      ? produtos.filter((p: Produto) => p.evento_id === filtros.evento)
      : produtos

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
          <div className="mb-6 dark:text-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
              <div>
                <h1 className="heading">Relatórios</h1>
                <p className="text-sm text-gray-700 mt-1 dark:text-gray-100">
                  Análise completa com filtros avançados.
                </p>
              </div>

              {/* Dropdown de Exportação */}
              <div className="relative" ref={exportDropdownRef}>
                <button
                  onClick={() => !isExporting && setIsExportDropdownOpen(!isExportDropdownOpen)}
                  disabled={isExporting}
                  className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start ${
                    isExporting 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Gerando...</span>
                      <span className="sm:hidden">Gerando...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Exportar</span>
                      <span className="sm:hidden">Exportar</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isExportDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </>
                  )}
                </button>

                {isExportDropdownOpen && !isExporting && (
                  <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                    <div className="py-1">
                      <button
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                          isExporting
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isExporting ? (
                          <>
                            <svg className="animate-spin w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Gerando Excel...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Exportar Excel
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                          isExporting
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isExporting ? (
                          <>
                            <svg className="animate-spin w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Gerando PDF...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            Exportar PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {filtros.evento !== 'todos' && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-700">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Analisando evento:{' '}
                  <span className="font-bold">
                    {eventos.find((e) => e.id === filtros.evento)?.titulo ||
                      'Evento selecionado'}
                  </span>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Dados isolados por evento para evitar mistura entre diferentes
                  eventos
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Filters Section */}
          <div className="card mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
                Filtros
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {/* Evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Evento
                  </label>
                  <select
                    value={filtros.evento}
                    onChange={(e) =>
                      handleFiltroChange('evento', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todos os eventos</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Produto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tipo de Produto
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getProdutoOptions().length > 0 ? (
                      getProdutoOptions().map((produto: Produto) => (
                        <label key={produto.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filtros.produto.includes(produto.id)}
                            onChange={() =>
                              handleFiltroChange('produto', produto.id)
                            }
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {produto.nome}
                          </span>
                        </label>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        Nenhum produto disponível
                      </span>
                    )}
                  </div>
                </div>

                {/* Campo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Campo
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getCampoOptions().map((campo) => (
                      <label key={campo.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtros.campo.includes(campo.id)}
                          onChange={() => handleFiltroChange('campo', campo.id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {campo.nome}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Canal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Canal de Venda
                  </label>
                  <div className="space-y-2">
                    {getCanalOptions().map((canal) => (
                      <label key={canal.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtros.canal.includes(canal.value)}
                          onChange={() =>
                            handleFiltroChange('canal', canal.value)
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {canal.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período
                  </label>
                  <select
                    value={filtros.periodo}
                    onChange={(e) =>
                      handleFiltroChange('periodo', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todo o período</option>
                    <option value="ultima_semana">Última semana</option>
                    <option value="ultimo_mes">Último mês</option>
                    <option value="ultimos_3_meses">Últimos 3 meses</option>
                    <option value="ultimo_ano">Último ano</option>
                  </select>
                </div>

                {/* Tamanho */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tamanho da Camisa
                  </label>
                  <div className="space-y-2">
                    {getTamanhoOptions().map((tamanho) => (
                      <label key={tamanho} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtros.tamanho.includes(tamanho)}
                          onChange={() =>
                            handleFiltroChange('tamanho', tamanho)
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {tamanho}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter actions */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {inscricoesFiltradas.length} inscrições e{' '}
                  {pedidosFiltrados.length} pedidos
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

          {/* Dashboard Resumo */}
          <DashboardResumo
            inscricoes={inscricoesFiltradas}
            pedidos={pedidosFiltrados}
            produtos={produtos}
          />

          {/* Unified Chart */}
          <div className="card mb-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">
              Produtos por Campo
            </h3>
            <div className="aspect-video">
              <BarChart
                ref={chartRef}
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Distribuição de Produtos por Campo',
                    },
                  },
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </>
      )}
    </main>
  )
}
