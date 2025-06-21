'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useMemo, useRef, useState } from 'react'
import createPocketBase from '@/lib/pocketbase'
import type { Inscricao, Pedido } from '@/types'
import DashboardResumo from './components/DashboardResumo'
import DashboardAnalytics from '../components/DashboardAnalytics'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'

export default function DashboardPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const pb = useMemo(() => createPocketBase(), [])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filtroStatus, setFiltroStatus] = useState('pago')
  const isMounted = useRef(true)

  useEffect(() => {
    if (!authChecked || !user?.id || !user?.role) return
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        const expandedUser = await pb.collection('usuarios').getOne(user.id, {
          expand: 'campo',
          signal,
        })

        const perPage = 50
        const filtroCliente = `cliente='${user.cliente}'`
        const [inscricoesRes, pedidosRes] = await Promise.all([
          pb.collection('inscricoes').getList(page, perPage, {
            expand: 'campo,evento,criado_por,pedido',
            filter: filtroCliente,
            signal,
          }),
          pb.collection('pedidos').getList(page, perPage, {
            expand: 'campo,criado_por',
            filter: filtroCliente,
            signal,
          }),
        ])
        const rawInscricoes = inscricoesRes.items
        const rawPedidos = pedidosRes.items
        setTotalPages(Math.max(inscricoesRes.totalPages, pedidosRes.totalPages))

        if (!isMounted.current) return

        const campoId = expandedUser.expand?.campo?.id

        const allInscricoes: Inscricao[] = rawInscricoes.map((r) => ({
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
        }))

        const allPedidos: Pedido[] = rawPedidos.map((r) => ({
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
          },
        }))

        if (user.role === 'coordenador') {
          setInscricoes(allInscricoes)
          setPedidos(allPedidos)
        } else {
          setInscricoes(allInscricoes.filter((i) => i.campo === campoId))
          setPedidos(allPedidos.filter((p) => p.expand?.campo?.id === campoId))
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Erro no dashboard:', err.message)
        }
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted.current = false
      controller.abort()
    }
  }, [authChecked, user?.id, user?.role, user?.cliente, pb, page])

  return (
    <main className="min-h-screen  p-4 md:p-6">
      {!authChecked || !user || loading ? (
        <LoadingOverlay show={true} text="Carregando painel..." />
      ) : (
        <>
          <div className="mb-6 text-center dark:text-gray-100">
            <h1 className="heading">
              Painel de{' '}
              {user.role === 'coordenador' ? 'Coordenação' : 'Liderança'}
            </h1>
            <p className="text-sm text-gray-700 mt-1 dark:text-gray-100">
              Bem-vindo(a), <span className="font-semibold">{user.nome}</span>!
            </p>
          </div>

          <DashboardResumo
            inscricoes={inscricoes}
            pedidos={pedidos}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
          />
          <DashboardAnalytics inscricoes={inscricoes} pedidos={pedidos} />
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              className="btn btn-primary px-3 py-1"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span className="text-sm">
              Página {page} de {totalPages}
            </span>
            <button
              className="btn btn-primary px-3 py-1"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </main>
  )
}
