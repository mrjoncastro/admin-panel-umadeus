import type { Meta, StoryObj } from '@storybook/nextjs';
import PostSuggestions from '../app/blog/components/PostSuggestions';

interface Post {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  category: string;
}

const meta = {
  title: 'Blog/PostSuggestions',
  component: PostSuggestions,
  argTypes: {
    posts: { control: 'object' },
  },
  args: {
    posts: [
      {
        slug: 'bem-estar-no-trabalho',
        title: 'Bem-estar no trabalho',
        summary: 'Dicas para manter a saúde no escritório.',
        thumbnail: 'https://placehold.co/400x300',
        category: 'Saúde',
      },
      {
        slug: 'dormir-melhor',
        title: 'Como dormir melhor',
        summary: 'Estratégias simples para aprimorar o sono.',
        thumbnail: 'https://placehold.co/400x300',
        category: 'Qualidade de vida',
      },
      {
        slug: 'alimentacao-em-dia',
        title: 'Alimentação em dia',
        summary: 'Refeições saudáveis para o dia a dia.',
        thumbnail: 'https://placehold.co/400x300',
        category: 'Nutrição',
      },
    ] as Post[],
  },
} satisfies Meta<typeof PostSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
