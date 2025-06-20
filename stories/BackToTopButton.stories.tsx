import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { within, expect } from 'storybook/test'
import BackToTopButton from '../app/admin/components/BackToTopButton'

const meta = {
  title: 'Admin/BackToTopButton',
  component: BackToTopButton,
  tags: ['autodocs'],
} satisfies Meta<typeof BackToTopButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ height: '200vh', paddingTop: '350px' }}>
      <BackToTopButton />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    window.scrollTo(0, 400)
    await expect(
      canvas.getByRole('button', { name: /voltar ao topo/i }),
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
        <BackToTopButton {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <BackToTopButton {...args} />
      </TenantProvider>
    </div>
  ),
}
