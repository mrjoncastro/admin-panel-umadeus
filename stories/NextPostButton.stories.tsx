import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import NextPostButton from '@/components/molecules/NextPostButton'

const meta = {
  title: 'Blog/NextPostButton',
  component: NextPostButton,
  argTypes: {
    slug: { control: 'text' },
  },
  args: {
    slug: 'proximo-post',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NextPostButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

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
        <NextPostButton {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <NextPostButton {...args} />
      </TenantProvider>
    </div>
  ),
}
