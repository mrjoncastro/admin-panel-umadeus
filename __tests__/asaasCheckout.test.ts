import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildCheckoutUrl } from '../lib/asaas';
import { POST } from '../app/admin/api/asaas/checkout/route';
import { NextRequest } from 'next/server';
vi.mock('../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../lib/apiAuth'

describe('buildCheckoutUrl', () => {
  it('normaliza barra ao final', () => {
    expect(buildCheckoutUrl('https://asaas')).toBe('https://asaas/checkouts');
    expect(buildCheckoutUrl('https://asaas/')).toBe('https://asaas/checkouts');
  });
});

describe('checkout route', () => {
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = { ...originalEnv, ASAAS_API_URL: 'https://asaas', ASAAS_API_KEY: 'key' };
    (requireRole as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      pb: {
        authStore: { isValid: true },
        admins: { authWithPassword: vi.fn() },
        collection: () => ({ getFirstListItem: vi.fn() })
      } as any,
      user: { role: 'coordenador' }
    });
  });
  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  const basePayload = {
    valor: 10,
    itens: [
      {
        name: 'p',
        description: 'p',
        quantity: 1,
        value: 10,
        fotoBase64: 'data:image/png;base64,a'
      }
    ],
    successUrl: 'https://sucesso',
    errorUrl: 'https://erro',
    clienteId: 'cli1',
    usuarioId: 'user1',
    inscricaoId: 'ins1',
    cliente: {
      nome: 'João',
      email: 'j@x.com',
      telefone: '111',
      cpf: '000',
      endereco: 'rua',
      numero: '1',
      estado: 'BA',
      cep: '000',
      cidade: '123',
    },
    installments: 1,
    paymentMethods: ['PIX', 'CREDIT_CARD'],
  };

  it('executa POST e retorna checkoutUrl', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ checkoutUrl: 'url' }))
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(basePayload)
    });

    const res = await POST(req as unknown as NextRequest);
    const data = await res.json();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://asaas/checkouts',
      expect.objectContaining({ body: expect.any(String) })
    );
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody.externalReference).toBe(
      'cliente_cli1_usuario_user1_inscricao_ins1'
    );
    expect(data.checkoutUrl).toBe('url');
  });

  it('retorna 400 quando corpo inválido', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        valor: 'a',
        itens: [],
      })
    });

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando itens incompletos', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        itens: [{ quantity: 1, value: 10 }],
      })
    });

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando successUrl inválida', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        successUrl: 'nota-url'
      })
    });

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando errorUrl inválida', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        errorUrl: 'nota-url'
      })
    });

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(400);
  });
});
