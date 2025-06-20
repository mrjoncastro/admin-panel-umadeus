import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import BlogSidebar from '@/components/organisms/BlogSidebar'
import React, { useEffect } from 'react'

interface Post {
  title: string
  slug: string
  thumbnail?: string | null
  category?: string | null
}

const meta = {
  title: 'Blog/Sidebar',
  component: BlogSidebar,
  argTypes: {
    posts: { control: 'object' },
  },
  args: {
    posts: [
      {
        title: 'Benefícios da Telemedicina',
        slug: 'beneficios-telemedicina',
        thumbnail: 'https://placehold.co/100',
        category: 'Saúde',
      },
      {
        title: 'Dicas de Bem-estar',
        slug: 'dicas-bem-estar',
        thumbnail: 'https://placehold.co/100',
        category: 'Bem-estar',
      },
      {
        title: 'Alimentação Equilibrada',
        slug: 'alimentacao-equilibrada',
        thumbnail: 'https://placehold.co/100',
        category: 'Nutrição',
      },
    ] as Post[],
  },
} satisfies Meta<typeof BlogSidebar>

export default meta
type Story = StoryObj<typeof meta>

const FetchWrapper = ({
  posts,
  children,
}: {
  posts: Post[]
  children: React.ReactNode
}) => {
  useEffect(() => {
    const original = global.fetch
    global.fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify(posts), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    return () => {
      global.fetch = original
    }
  }, [posts])
  return <>{children}</>
}

export const Default: Story = {
  render: (args) => {
    const { posts } = args as { posts: Post[] }
    return (
      <FetchWrapper posts={posts}>
        <BlogSidebar />
      </FetchWrapper>
    )
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
        <BlogSidebar {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <BlogSidebar {...args} />
      </TenantProvider>
    </div>
  ),
}
