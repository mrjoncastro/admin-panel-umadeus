import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { userEvent, within, expect } from 'storybook/test'
import { useState } from 'react'
import PostContentEditor from '../app/admin/posts/components/PostContentEditor'

function Demo() {
  const [content, setContent] = useState('<h1>Título</h1>')
  const [preview, setPreview] = useState(false)

  return preview ? (
    <div>
      <button onClick={() => setPreview(false)}>Editar</button>
      <article
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  ) : (
    <div>
      <PostContentEditor value={content} onChange={setContent} />
      <button onClick={() => setPreview(true)}>Pré-visualizar</button>
    </div>
  )
}

const meta = {
  title: 'Admin/PostPreviewToggle',
  component: Demo,
  tags: ['autodocs'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: /pré-visualizar/i }),
    )
    await expect(
      canvas.getByRole('button', { name: /editar/i }),
    ).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: /editar/i }))
    await expect(
      canvas.getByRole('button', { name: /pré-visualizar/i }),
    ).toBeInTheDocument()
  },
}

export const TemaDinamico: Story = {
  render: (args) => (
    <div className=\"space-y-4\">
      <TenantProvider
        initialConfig={{
          primaryColor: '#2563eb',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <Demo {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <Demo {...args} />
      </TenantProvider>
    </div>
  ),
}
