'use client'

import { Inscricao } from '@/types'

export interface ListaClientesProps {
  clientes: Inscricao[]
  onEdit: (cliente: Inscricao) => void
}

export default function ListaClientes({
  clientes,
  onEdit,
}: ListaClientesProps) {
  return (
    <div className="overflow-auto rounded-lg border bg-white border-gray-300 dark:bg-neutral-950 dark:border-gray-700 shadow-sm">
      <table className="table-base">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Status Pedido</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td className="font-medium">{c.nome}</td>
              <td>{c.telefone}</td>
              <td className="capitalize">{c.expand?.pedido?.status ?? '—'}</td>
              <td>{c.expand?.pedido?.valor ?? '—'}</td>
              <td>
                <button
                  onClick={() => onEdit(c)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
