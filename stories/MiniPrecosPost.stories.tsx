import type { Meta, StoryObj } from '@storybook/nextjs';
import MiniPrecosPost from '../app/blog/components/MiniPrecosPost';

const meta = {
  title: 'Blog/MiniPrecosPost',
  component: MiniPrecosPost,
  tags: ['autodocs'],
} satisfies Meta<typeof MiniPrecosPost>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
