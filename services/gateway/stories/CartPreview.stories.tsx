import type { Meta, StoryObj } from '@storybook/nextjs'
import CartPreview from '@/components/molecules/CartPreview'
import { CartProvider } from '../lib/context/CartContext'
import { ThemeProvider } from '../lib/context/ThemeContext'

const meta = {
  title: 'Components/CartPreview',
  component: CartPreview,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <CartProvider>
          <Story />
        </CartProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CartPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
