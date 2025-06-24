'use client'

import { useState } from 'react'
import ContentEditable, { type ContentEditableEvent } from 'react-contenteditable'
import { Button, FormField, TextField } from '@/components'
import { Produto } from '@/types'
import ProdutoCardPreview from '@/components/admin/ProdutoCardPreview'
import ProdutoDetailPreview from '@/components/admin/ProdutoDetailPreview'

export default function ProdutoBuilderPage() {
  const [form, setForm] = useState({ nome: '', preco: '', descricao: '' })
  const [preview, setPreview] = useState<Produto | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleDescChange(e: ContentEditableEvent) {
    setForm((f) => ({ ...f, descricao: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/admin/api/preview-produto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        preco: Number(form.preco),
        descricao: form.descricao,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setPreview(data)
    } else {
      setPreview(null)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Construtor de Produto</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <FormField label="Nome">
          <TextField name="nome" value={form.nome} onChange={handleChange} required />
        </FormField>
        <FormField label="Preço">
          <TextField
            name="preco"
            type="number"
            value={form.preco}
            onChange={handleChange}
            required
          />
        </FormField>
        <FormField label="Descrição">
          <ContentEditable
            html={form.descricao}
            onChange={handleDescChange}
            className="input-base min-h-[80px]"
          />
        </FormField>
        <Button type="submit">Visualizar</Button>
      </form>
      {preview && (
        <div className="space-y-8">
          <ProdutoCardPreview produto={preview} />
          <ProdutoDetailPreview produto={preview} />
        </div>
      )}
    </div>
  )
}
