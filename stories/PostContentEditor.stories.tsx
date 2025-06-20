import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import React, { useState } from 'react'
import { fn } from 'storybook/test'
import PostContentEditor from '../app/admin/posts/components/PostContentEditor'

const meta = {
  title: 'Admin/PostContentEditor',
  component: PostContentEditor,
  argTypes: {
    value: { control: 'text' },
    onChange: { action: 'changed' },
  },
  args: {
    value: '<h1>Post de Exemplo</h1>\n<p>Edite o conteúdo...</p>',
    onChange: fn(),
  },
} satisfies Meta<typeof PostContentEditor>

export default meta
type Story = StoryObj<typeof meta>

const Template = ({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) => {
  const [content, setContent] = useState(value)
  return (
    <PostContentEditor
      value={content}
      onChange={(val) => {
        setContent(val)
        onChange(val)
      }}
    />
  )
}

export const Default: Story = {
  render: (args) => <Template value={args.value} onChange={args.onChange} />,
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
        <PostContentEditor {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <PostContentEditor {...args} />
      </TenantProvider>
    </div>
  ),
}
