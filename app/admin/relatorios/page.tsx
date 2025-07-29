'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useRef, useState } from 'react'
import type { Inscricao, Pedido, Produto } from '@/types'
import DashboardAnalytics from '../components/DashboardAnalytics'
import DashboardResumo from '../dashboard/components/DashboardResumo'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import { fetchAllPages } from '@/lib/utils/fetchAllPages'

// Enhanced filtering interface
interface Filtros {
  status: string
  statusInscricoes: string
  produto: string
  campo: string
  periodo: string
  canal: string
}

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

    setInscricoesFiltradas(inscricoesResult)
    setPedidosFiltrados(pedidosResult)
  }, [inscricoes, pedidos, filtros])

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
            expand: {
              campo: r.expand?.campo,
              criado_por: r.expand?.criado_por,
              pedido: r.expand?.pedido,
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
    </main>
  )
}
