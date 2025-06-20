import type { Meta, StoryObj } from '@storybook/nextjs';
import { FormField } from '../components/molecules/FormField';
import { TextField } from '../components/atoms/TextField';
import { TenantProvider } from '../lib/context/TenantContext';

const meta = {
  title: 'Design System/FormField',
  component: FormField,
  tags: ['autodocs'],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Nome', htmlFor: 'nome', children: <TextField id="nome" /> },
  render: (args) => (
    <FormField {...args}>
      {args.children}
    </FormField>
  ),
};

export const TemaDinamico: Story = {
  args: { label: 'Nome', htmlFor: 'nome', children: <TextField id="nome1" /> },
  render: (args) => (
    <div className="space-y-4">
      <TenantProvider initialConfig={{ primaryColor: '#2563eb', font: 'var(--font-geist)', logoUrl: '/img/logo_umadeus_branco.png', confirmaInscricoes: false }}>
        <FormField {...args}>
          {args.children}
        </FormField>
      </TenantProvider>
      <TenantProvider initialConfig={{ primaryColor: '#dc2626', font: 'var(--font-geist)', logoUrl: '/img/logo_umadeus_branco.png', confirmaInscricoes: false }}>
        <FormField {...args}>
          <TextField id="nome2" />
        </FormField>
      </TenantProvider>
    </div>
  ),
};

