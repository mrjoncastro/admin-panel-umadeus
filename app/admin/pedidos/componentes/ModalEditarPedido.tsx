'use client'

import { FormEvent, useState } from 'react'
import { Pedido } from '@/types'

type Props = {
  pedido: Pedido
  onClose: () => void
  onSave: (dadosAtualizados: Partial<Pedido>) => void
}

export default function ModalEditarPedido({ pedido, onClose, onSave }: Props) {
  const [formState, setFormState] = useState<Partial<Pedido>>({
    produto: pedido.produto,
    email: pedido.email,
    tamanho: pedido.tamanho,
    cor: pedido.cor,
    status: pedido.status,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSave(formState)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Editar Pedido</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            name="produto"
            label="Produto"
            value={formState.produto || ''}
            onChange={handleChange}
          />
          <Input
            name="email"
            label="Email"
            value={formState.email || ''}
            onChange={handleChange}
          />
          <Input
            name="tamanho"
            label="Tamanho"
            value={formState.tamanho || ''}
            onChange={handleChange}
          />
          <Input
            name="cor"
            label="Cor"
            value={formState.cor || ''}
            onChange={handleChange}
          />
          <Select
            name="status"
            label="Status"
            value={formState.status || ''}
            onChange={handleChange}
          >
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </Select>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type InputProps = {
  name: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function Input({ name, label, value, onChange }: InputProps) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium block mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded"
      />
    </div>
  )
}

type SelectProps = {
  name: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}

function Select({ name, label, value, onChange, children }: SelectProps) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium block mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded"
      >
        {children}
      </select>
    </div>
  )
}
