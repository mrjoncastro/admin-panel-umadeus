/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TransferenciasPage from '@/app/admin/financeiro/transferencias/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ isLoggedIn: true }),
}))

vi.mock('@/lib/context/ToastContext', () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}))

vi.mock(
  '@/app/admin/financeiro/transferencias/components/TransferenciaForm',
  () => ({
    __esModule: true,
    default: ({ onTransfer }: { onTransfer: Function }) => (
      <button
        onClick={() =>
          onTransfer('acc', 10, 'desc', true, {
            pixAddressKey: 'k',
            pixAddressKeyType: 'email',
          } as any)
        }
      >
        enviar
      </button>
    ),
  }),
)

describe('TransferenciasPage', () => {
  it('envia operationType para PIX', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch
    render(<TransferenciasPage />)
    fireEvent.click(screen.getByRole('button'))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/asaas/transferencia',
      expect.objectContaining({
        body: expect.stringContaining('"operationType":"PIX"'),
      }),
    )
  })
})
