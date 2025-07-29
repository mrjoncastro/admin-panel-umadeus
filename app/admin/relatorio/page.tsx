'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

import { useToast } from '@/lib/context/ToastContext'
import { useEffect, useState, useRef, useCallback } from 'react'
import type { Pedido, Produto } from '@/types'
import { fetchAllPages } from '@/lib/utils/fetchAllPages'
import dynamic from 'next/dynamic'
import { setupCharts } from '@/lib/chartSetup'
import { createPattern, PatternType } from '@/utils/chartPatterns'
import type { Chart, ChartData } from 'chart.js'

const BarChart = dynamic(() => import('react-chartjs-2').then((m) => m.Bar), {
  ssr: false,
})

// Enhanced filtering interface
interface FiltrosRelatorio {
  status: string
  produto: string
  campo: string
  periodo: string
  canal: string
  tamanho: string
}

export default function RelatorioPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const { showError } = useToast()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [campos, setCampos] = useState<{ id: string; nome: string }[]>([])

  const [chartData, setChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  })
  const chartRef = useRef<Chart<'bar'> | null>(null)

  // Enhanced filters state
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    status: 'todos',
    produto: 'todos',
    campo: 'todos',
    periodo: 'todos',
    canal: 'todos',
    tamanho: 'todos',
  })

  // Filtered pedidos based on active filters
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([])

  // Apply filters to data
  useEffect(() => {
    let pedidosResult = [...pedidos]

    // Apply filters
    if (filtros.status !== 'todos') {
      pedidosResult = pedidosResult.filter((p) => p.status === filtros.status)
    }
    if (filtros.produto !== 'todos') {
      pedidosResult = pedidosResult.filter((p) => {
        if (Array.isArray(p.produto)) {
          return p.produto.includes(filtros.produto)
        }
        // Check expanded produto
        if (p.expand?.produto) {
          if (Array.isArray(p.expand.produto)) {
            return p.expand.produto.some(
              (prod: Produto) => prod.id === filtros.produto,
            )
          } else {
            return p.expand.produto.id === filtros.produto
          }
        }
        return false
      })
    }
    if (filtros.campo !== 'todos') {
      pedidosResult = pedidosResult.filter((p) => p.campo === filtros.campo)
    }
    if (filtros.tamanho !== 'todos') {
      pedidosResult = pedidosResult.filter((p) => p.tamanho === filtros.tamanho)
    }
    if (filtros.canal !== 'todos') {
      pedidosResult = pedidosResult.filter((p) => p.canal === filtros.canal)
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

    setPedidosFiltrados(pedidosResult)
  }, [pedidos, filtros])

  const sortPedidos = useCallback(
    (lista: Pedido[]) => {
      return [...lista].sort((a, b) => {
        const campoA = a.expand?.campo?.nome || ''
        const campoB = b.expand?.campo?.nome || ''
        return campoA.localeCompare(campoB)
      })
    },
    [],
  )

  useEffect(() => {
    setupCharts()
  }, [])

  useEffect(() => {
    if (!authChecked || !user) return
    const controller = new AbortController()
    const signal = controller.signal
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page: '1',
          perPage: '50',
          expand: 'campo,produto,id_inscricao,responsavel',
        })

        // Fetch pedidos
        const baseUrl = `/api/pedidos?${params.toString()}`
        const res = await fetch(baseUrl, { credentials: 'include', signal })
        if (!res.ok) throw new Error('Erro ao obter pedidos')
        const data = await res.json()
        const rest = await fetchAllPages<{ items?: Pedido[] } | Pedido>(
          baseUrl,
          data.totalPages ?? 1,
          signal,
        )
        let lista: Pedido[] = Array.isArray(data.items)
          ? (data.items as Pedido[])
          : (data as Pedido[])
        lista = lista.concat(
          rest.flatMap((r) =>
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

        // Filtrar apenas produtos ativos
        const produtosAtivos = produtos.filter((p: Produto) => p.ativo === true)

        // Fetch campos for filter options
        const camposRes = await fetch(`/api/campos?${params.toString()}`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const campos = Array.isArray(camposRes.items)
          ? camposRes.items
          : camposRes

        if (user.role === 'lider') {
          lista = lista.filter(
            (p: Pedido) => p.expand?.campo?.id === user.campo,
          )
          setCampos(campos.filter((c: { id: string }) => c.id === user.campo))
        } else {
          setCampos(campos)
        }

        setPedidos(lista)
        setProdutos(produtosAtivos)
      } catch (err) {
        console.error('Erro ao carregar pedidos', err)
        showError('Erro ao carregar pedidos')
      }
    }
    fetchData()
    return () => controller.abort()
  }, [authChecked, user, showError])

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
        backgroundColor: createPattern(
          patterns[idx % patterns.length],
          '#666',
        ),
        borderColor: '#000',
        stack: 'stack',
      }
    })

    setChartData({ labels, datasets })
  }, [pedidosFiltrados, sortPedidos])

  const handleFiltroChange = (key: keyof FiltrosRelatorio, value: string) => {
    setFiltros((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearAllFilters = () => {
    setFiltros({
      status: 'todos',
      produto: 'todos',
      campo: 'todos',
      periodo: 'todos',
      canal: 'todos',
      tamanho: 'todos',
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Relatório Detalhado</h1>

      {/* Enhanced Filters Section */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Filtros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Situação
              </label>
              <select
                value={filtros.status}
                onChange={(e) => handleFiltroChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="vencido">Vencido</option>
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
                {produtos.length > 0 ? (
                  produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Nenhum produto disponível
                  </option>
                )}
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

            {/* Tamanho */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tamanho da Camisa
              </label>
              <select
                value={filtros.tamanho}
                onChange={(e) => handleFiltroChange('tamanho', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="todos">Todos os tamanhos</option>
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
              </select>
            </div>
          </div>

          {/* Filter actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {pedidosFiltrados.length} pedidos filtrados
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

      {/* Remova o bloco <section> de Análises e o select de análise */}
      {/* No filtro de status, remova a opção 'Todos' */}
      {/* No filtro de produto, remova a opção 'Todos' */}
      {/* Após o bloco de filtros, exiba apenas o gráfico principal (BarChart) */}
      <div className="mt-4 aspect-video">
        <BarChart
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { stacked: true }, y: { stacked: true } },
          }}
        />
      </div>
    </div>
  )
}
