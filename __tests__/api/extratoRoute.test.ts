import { describe, it, expect, vi } from 'vitest';
import { GET } from '../../app/admin/api/asaas/extrato/route';
import { NextRequest } from 'next/server';

vi.mock('../../lib/clienteAuth', () => ({ requireClienteFromHost: vi.fn() }));
import { requireClienteFromHost } from '../../lib/clienteAuth';

describe('GET /admin/api/asaas/extrato', () => {
  it('retorna 403 quando requireClienteFromHost falha', async () => {
    (requireClienteFromHost as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      error: 'forbidden',
      status: 403,
    });
    const req = new Request('http://test');
    (req as any).nextUrl = new URL('http://test');
    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(403);
  });

  it('retorna json quando sucesso', async () => {
    (requireClienteFromHost as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      pb: {
        authStore: { isValid: true },
        admins: { authWithPassword: vi.fn() },
        collection: () => ({ getFirstListItem: vi.fn() }),
      } as any,
      cliente: { nome: 'Tenant', asaas_api_key: 'key' },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    }) as unknown as typeof fetch;

    process.env.ASAAS_API_URL = 'https://asaas';
    process.env.ASAAS_API_KEY = 'key';

    const req = new Request('http://test');
    (req as any).nextUrl = new URL('http://test');
    const res = await GET(req as unknown as NextRequest);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({ data: [] });
  });
});
