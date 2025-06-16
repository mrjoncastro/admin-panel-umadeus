import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchBanks, createBankAccount, getBankAccountsByTenant } from '../lib/bankAccounts';
import type PocketBase from 'pocketbase';

describe('searchBanks', () => {
  const env = process.env;
  beforeEach(() => {
    process.env = { ...env, NEXT_PUBLIC_BRASILAPI_URL: 'https://brasil' } as NodeJS.ProcessEnv;
  });
  afterEach(() => {
    process.env = env;
    vi.restoreAllMocks();
  });
  it('monta url e retorna lista', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ ispb: '1', name: 'Bank', code: 10 }]),
    });
    const banks = await searchBanks('Bank', fetchMock);
    expect(fetchMock).toHaveBeenCalledWith('https://brasil/api/banks/v1?search=Bank');
    expect(banks[0].code).toBe(10);
  });

  it('lista inicial quando query vazia', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(Array.from({ length: 20 }, (_, i) => ({ ispb: String(i), name: `Bank${i}`, code: i }))),
    });
    const banks = await searchBanks('', fetchMock);
    expect(fetchMock).toHaveBeenCalledWith('https://brasil/api/banks/v1');
    expect(banks.length).toBe(15);
  });
});

describe('createBankAccount', () => {
  it('envia dados para pocketbase', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' });
    const pb = {
      collection: vi.fn(() => ({ create: createMock })),
    } as unknown as PocketBase;
    await createBankAccount(
      pb,
      {
        ownerName: 'Titular',
        accountName: 'a',
        cpfCnpj: 'b',
        ownerBirthDate: 'c',
        bankName: 'd',
        bankCode: '1',
        ispb: '2',
        agency: '3',
        account: '4',
        accountDigit: '5',
        bankAccountType: 'corrente',
      },
      'u1',
      'cli1'
    );
    expect(pb.collection).toHaveBeenCalledWith('clientes_contas_bancarias');
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario: 'u1',
        cliente: 'cli1',
        ownerName: 'Titular',
        accountName: 'a',
      })
    );
  });

  it('inclui accountName no payload', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' });
    const pb = {
      collection: vi.fn(() => ({ create: createMock })),
    } as unknown as PocketBase;
    await createBankAccount(
      pb,
      {
        ownerName: 'Titular',
        accountName: 'Conta Salario',
        cpfCnpj: 'b',
        ownerBirthDate: 'c',
        bankName: 'd',
        bankCode: '1',
        ispb: '2',
        agency: '3',
        account: '4',
        accountDigit: '5',
        bankAccountType: 'conta_salario',
      },
      'u1',
      'cli1'
    );
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ ownerName: 'Titular', accountName: 'Conta Salario', bankAccountType: 'conta_salario' })
    );
  });
});

describe('getBankAccountsByTenant', () => {
  it('filtra por cliente', async () => {
    const listMock = vi.fn().mockResolvedValue([{ id: '1', cliente: 'cli1' }]);
    const pb = {
      collection: vi.fn(() => ({ getFullList: listMock })),
    } as unknown as PocketBase;
    const contas = await getBankAccountsByTenant(pb, 'cli1');
    expect(pb.collection).toHaveBeenCalledWith('clientes_contas_bancarias');
    expect(listMock).toHaveBeenCalledWith({ filter: "cliente='cli1'" });
    expect(contas[0].id).toBe('1');
  });
});
