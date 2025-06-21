'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import createPocketBase from '@/lib/pocketbase'
import type { Inscricao, Pedido } from '@/types'

export default function AreaCliente() {
  const { user, authChecked } = useAuthGuard(['usuario'])
  const pb = useMemo(() => createPocketBase(), [])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  useEffect(() => {
    if (!authChecked || !user) return
    const token = pb.authStore.token
    const headers = {
      Authorization: `Bearer ${token}`,
      'X-PB-User': JSON.stringify(user),
    }

    fetch('/loja/api/minhas-inscricoes', { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setInscricoes(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Erro ao carregar inscricoes', err)
        setInscricoes([])
      })

    fetch('/loja/api/pedidos', { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setPedidos(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Erro ao carregar pedidos', err)
        setPedidos([])
      })
  }, [authChecked, user, pb])

  if (!authChecked) return null

  return (
    <main className="p-8 text-platinum font-sans space-y-10">
      <section className="card">
        <h2 className="text-xl font-bold">Resumo do Cliente</h2>
        <p>
          <strong>Nome:</strong> {user?.nome || '-'}
        </p>
        <p>
          <strong>E-mail:</strong> {user?.email || '-'}
        </p>
        <p>
          <strong>Telefone:</strong> {String(user?.telefone ?? '-')}
        </p>

        <div className="flex flex-wrap gap-2 pt-4">
          <a href="/loja/perfil" className="btn btn-secondary">
            Alterar dados pessoais
          </a>
          <a href="/admin/redefinir-senha" className="btn btn-secondary">
            Alterar senha
          </a>
          <button type="button" className="btn btn-secondary" disabled>
            Gerenciar endereços
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold mb-4">Minhas Inscrições</h2>
        <table className="table-base">
          <thead>
            <tr>
              <th>Status</th>
              <th>Evento</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {inscricoes.map((i) => (
              <tr key={i.id}>
                <td className="capitalize">{i.status}</td>
                <td>{i.expand?.evento?.titulo || '-'}</td>
                <td>
                  {i.created
                    ? new Date(i.created).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold mb-4">Pagamentos</h2>
        <table className="table-base">
          <thead>
            <tr>
              <th>ID</th>
              <th>Valor</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.id_pagamento || p.id}</td>
                <td>R$ {Number(p.valor).toFixed(2)}</td>
                <td className="capitalize">{p.status}</td>
                <td className="flex gap-2">
                  <button className="btn btn-secondary">Reenviar boleto</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
