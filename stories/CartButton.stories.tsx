import type { Meta, StoryObj } from '@storybook/nextjs';
import CartButton from '../app/components/CartButton';
import { CartProvider } from '../lib/context/CartContext';
import { ThemeProvider } from '../lib/context/ThemeContext';

const meta = {
  title: 'Components/CartButton',
  component: CartButton,
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
} satisfies Meta<typeof CartButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
