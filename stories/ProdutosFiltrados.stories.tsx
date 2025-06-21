import type { Meta, StoryObj } from '@storybook/nextjs'
import ProdutosFiltrados from '@/components/organisms/ProdutosFiltrados'

const meta = {
  title: 'Loja/ProdutosFiltrados',
  component: ProdutosFiltrados,
  args: {
    produtos: [
      {
        id: '1',
        nome: 'Camiseta Feminina',
        preco: 79.9,
        imagens: ['https://placehold.co/400'],
        slug: 'camiseta-feminina',
      },
      {
        id: '2',
        nome: 'Camiseta Masculina',
        preco: 89.9,
        imagens: ['https://placehold.co/400'],
        slug: 'camiseta-masculina',
      },
    ],
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProdutosFiltrados>

export default meta

export type Story = StoryObj<typeof meta>

export const Default: Story = {}
