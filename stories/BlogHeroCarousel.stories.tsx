import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import BlogHeroCarousel from '@/components/organisms/BlogHeroCarousel'
import React, { useEffect } from 'react'

interface Post {
  title: string
  date: string
  summary: string
  slug: string
  thumbnail?: string | null
  category?: string | null
}

const meta = {
  title: 'Blog/HeroCarousel',
  component: BlogHeroCarousel,
  argTypes: {
    posts: { control: 'object' },
  },
  args: {
    posts: [
      {
        title: 'Primeiro Post',
        date: '2024-01-01',
        summary: 'Exemplo de resumo do post',
        slug: 'primeiro-post',
        thumbnail: 'https://placehold.co/600x400',
        category: 'Novidades',
      },
      {
        title: 'Segundo Post',
        date: '2024-01-02',
        summary: 'Outro resumo breve',
        slug: 'segundo-post',
        thumbnail: 'https://placehold.co/600x400',
        category: 'Saúde',
      },
      {
        title: 'Terceiro Post',
        date: '2024-01-03',
        summary: 'Mais um texto de exemplo',
        slug: 'terceiro-post',
        thumbnail: 'https://placehold.co/600x400',
        category: 'Bem-estar',
      },
    ] as Post[],
  },
} satisfies Meta<typeof BlogHeroCarousel>

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
        <BlogHeroCarousel />
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
        <BlogHeroCarousel {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <BlogHeroCarousel {...args} />
      </TenantProvider>
    </div>
  ),
}
