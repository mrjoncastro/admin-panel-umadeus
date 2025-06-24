'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, FormField } from '@/components'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useToast } from '@/lib/context/ToastContext'

interface Section {
  id: string
  type: string
}

function SortableItem({ id, type }: { id: string; type: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 border rounded-md bg-white mb-2 cursor-move"
    >
      {type}
    </div>
  )
}

export default function HomeBuilderPage() {
  const { authChecked } = useAuthGuard(['coordenador'])
  const { showError, showSuccess } = useToast()
  const [sections, setSections] = useState<Section[]>([])
  const [novoTipo, setNovoTipo] = useState('hero')

  useEffect(() => {
    if (!authChecked) return
    fetch('/api/home-sections', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setSections(Array.isArray(data) ? data : []))
      .catch(() => setSections([]))
  }, [authChecked])

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)
      setSections((items) => arrayMove(items, oldIndex, newIndex))
    }
  }

  async function salvarOrdem() {
    for (const [index, sec] of sections.entries()) {
      await fetch(`/api/home-sections/${sec.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordem: index }),
      })
    }
    showSuccess('Ordem salva')
  }

  async function publicar() {
    const res = await fetch('/admin/api/revalidate-loja', {
      method: 'POST',
    })
    if (res.ok) {
      showSuccess('Página publicada')
    } else {
      showError('Erro ao publicar')
    }
  }

  async function adicionarSecao(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/home-sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: novoTipo }),
    })
    if (res.ok) {
      const created = await res.json()
      setSections((s) => [...s, created])
      showSuccess('Seção criada')
    } else {
      showError('Erro ao criar')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Home Builder</h1>
      <form onSubmit={adicionarSecao} className="flex gap-2 mb-4 items-end">
        <FormField label="Tipo" className="flex-1">
          <select
            className="input-base w-full"
            value={novoTipo}
            onChange={(e) => setNovoTipo(e.target.value)}
          >
            <option value="hero">Hero</option>
            <option value="featuredProducts">Produtos</option>
            <option value="welcomingPhrase">Frase</option>
          </select>
        </FormField>
        <Button type="submit">Adicionar</Button>
      </form>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((s) => (
            <SortableItem key={s.id} id={s.id} type={s.type} />
          ))}
        </SortableContext>
      </DndContext>
      <Button onClick={salvarOrdem} className="mt-4">
        Salvar ordem
      </Button>
      <Button onClick={publicar} className="mt-2" variant="secondary">
        Publicar
      </Button>
    </div>
  )
}
