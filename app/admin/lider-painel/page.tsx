'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import DashboardAnalytics from '../components/DashboardAnalytics'
import type { Inscricao, Pedido } from '@/types'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'

export default function LiderDashboardPage() {
  const { user, authChecked } = useAuthGuard(['lider'])

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [totais, setTotais] = useState({
    inscricoes: { pendente: 0, confirmado: 0, cancelado: 0 },
    pedidos: { pendente: 0, pago: 0, cancelado: 0, valorTotal: 0 },
  })

  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const isMounted = useRef(true)

  useEffect(() => {
    if (!authChecked || !user) return

    const controller = new AbortController()
    const signal = controller.signal
    const fetchDados = async () => {
      try {
        const campoId = user.campo

        const perPage = 50
        const params = new URLSearchParams({
          page: String(page),
          perPage: String(perPage),
          filter: `campo="${campoId}" && cliente='${user?.cliente}'`,
        })
        const [insRes, pedRes] = await Promise.all([
          fetch(`/api/inscricoes?${params.toString()}`, {
            credentials: 'include',
            signal,
          }).then((r) => r.json()),
          fetch(`/api/pedidos?${params.toString()}&expand=campo,produto`, {
            credentials: 'include',
            signal,
          }).then((r) => r.json()),
        ])
        const rawInscricoes = Array.isArray(insRes.items)
          ? insRes.items
          : insRes
        const rawPedidos = Array.isArray(pedRes.items) ? pedRes.items : pedRes
        if (insRes.totalPages && pedRes.totalPages) {
          setTotalPages(Math.max(insRes.totalPages, pedRes.totalPages))
        }

        if (!isMounted.current) return

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

        setInscricoes(allInscricoes)
        setPedidos(allPedidos)

        const resumoPedidos = {
          pendente: allPedidos.filter((p) => p.status === 'pendente').length,
          pago: allPedidos.filter((p) => p.status === 'pago').length,
          cancelado: allPedidos.filter((p) => p.status === 'cancelado').length,
          valorTotal: allPedidos
            .filter((p) => p.status === 'pago')
            .reduce((acc, p) => acc + Number(p.valor || 0), 0),
        }

        const resumoInscricoes = {
          pendente: allInscricoes.filter((i) => i.status === 'pendente').length,
          confirmado: allInscricoes.filter((i) => i.status === 'confirmado')
            .length,
          cancelado: allInscricoes.filter((i) => i.status === 'cancelado')
            .length,
        }

        setTotais({ inscricoes: resumoInscricoes, pedidos: resumoPedidos })
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }

    fetchDados()
    return () => {
      isMounted.current = false
      controller.abort()
    }
  }, [authChecked, user, page])

  if (loading) {
    return <LoadingOverlay show={true} text="Carregando dashboard..." />
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="heading mb-6">Painel da Liderança</h1>

      {/* Cards Resumo */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="card p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Inscrições</h3>
          <p>Pendentes: {totais.inscricoes.pendente}</p>
          <p>Confirmadas: {totais.inscricoes.confirmado}</p>
          <p>Canceladas: {totais.inscricoes.cancelado}</p>
        </div>

        <div className="card p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Pedidos</h3>
          <p>Pendentes: {totais.pedidos.pendente}</p>
          <p>Pagos: {totais.pedidos.pago}</p>
          <p>Cancelados: {totais.pedidos.cancelado}</p>
        </div>

        {/* Removido card de Total Arrecadado */}
      </div>
      <DashboardAnalytics
        inscricoes={inscricoes}
        pedidos={pedidos}
        mostrarFinanceiro={false}
      />
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
    </main>
  )
}
