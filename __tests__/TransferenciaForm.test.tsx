/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransferenciaForm from '@/app/admin/financeiro/transferencias/components/TransferenciaForm';

vi.mock('../lib/hooks/usePocketBase', () => ({
  default: () => ({})
}));

vi.mock('../lib/context/AuthContext', () => ({
  useAuthContext: () => ({ tenantId: 'cli1' })
}));

vi.mock('../lib/bankAccounts', () => ({
  getBankAccountsByTenant: vi.fn().mockResolvedValue([
    { id: '1', accountName: 'Conta 1', ownerName: 'Fulano' },
    { id: '2', accountName: 'Conta 2', ownerName: 'Beltrano' },
  ]),
}));

describe('TransferenciaForm', () => {
  it('renderiza lista de contas bancarias', async () => {
    render(<TransferenciaForm />);
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[1].textContent).toContain('Conta 1');
    expect(options[2].textContent).toContain('Conta 2');
  });
});
