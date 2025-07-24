// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  expectTypeOf,
} from 'vitest'
import {
  searchBanks,
  createBankAccount,
  createPixKey,
  getBankAccountsByTenant,
  type ClienteContaBancariaRecord,
} from '../lib/bankAccounts'
// [REMOVED] PocketBase import
// [REMOVED] PocketBase import

describe('searchBanks', () => {
  const env = process.env
  beforeEach(() => {
    process.env = {
      ...env,
      NEXT_PUBLIC_BRASILAPI_URL: 'https://brasil',
    } as NodeJS.ProcessEnv
  })
  afterEach(() => {
    process.env = env
    vi.restoreAllMocks()
  })
  it('monta url e retorna lista', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ ispb: '1', name: 'Bank', code: 10 }]),
    })
    const banks = await searchBanks('Bank', fetchMock)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://brasil/api/banks/v1?search=Bank',
    )
    expect(banks[0].code).toBe(10)
  })

  it('lista inicial quando query vazia', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve(
          Array.from({ length: 20 }, (_, i) => ({
            ispb: String(i),
            name: `Bank${i}`,
            code: i,
          })),
        ),
    })
    const banks = await searchBanks('', fetchMock)
    expect(fetchMock).toHaveBeenCalledWith('https://brasil/api/banks/v1')
    expect(banks.length).toBe(15)
  })
})

describe('createBankAccount', () => {
  it('envia dados para pocketbase', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' })
    const pb = createPocketBaseMock() as unknown as PocketBase
    // pb. // [REMOVED] collection.mockReturnValue({ create: createMock })
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
      'cli1',
    )
    expect(// pb. // [REMOVED] collection).toHaveBeenCalledWith('clientes_contas_bancarias')
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario: 'u1',
        cliente: 'cli1',
        ownerName: 'Titular',
        accountName: 'a',
      }),
    )
  })

  it('inclui accountName no payload', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' })
    const pb = createPocketBaseMock() as unknown as PocketBase
    // pb. // [REMOVED] collection.mockReturnValue({ create: createMock })
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
      'cli1',
    )
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerName: 'Titular',
        accountName: 'Conta Salario',
        bankAccountType: 'conta_salario',
      }),
    )
  })
})

describe('createPixKey', () => {
  it('chama a coleção clientes_pix', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' })
    const pb = createPocketBaseMock() as unknown as PocketBase
    // pb. // [REMOVED] collection.mockReturnValue({ create: createMock })
    await createPixKey(
      pb,
      {
        pixAddressKey: 'chave@pix.com',
        pixAddressKeyType: 'email',
        description: 'Test',
        scheduleDate: '2024-01-01',
      },
      'u1',
      'cli1',
    )
    expect(// pb. // [REMOVED] collection).toHaveBeenCalledWith('clientes_pix')
  })

  it('inclui usuario e cliente no payload', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' })
    const pb = createPocketBaseMock() as unknown as PocketBase
    // pb. // [REMOVED] collection.mockReturnValue({ create: createMock })
    await createPixKey(
      pb,
      {
        pixAddressKey: 'a1',
        pixAddressKeyType: 'cpf',
        description: 'Desc',
        scheduleDate: '2024-02-02',
      },
      'user2',
      'client2',
    )
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ usuario: 'user2', cliente: 'client2' }),
    )
  })
})

describe('getBankAccountsByTenant', () => {
  it('filtra por cliente', async () => {
    const listMock = vi.fn().mockResolvedValue([{ id: '1', cliente: 'cli1' }])
    const pb = createPocketBaseMock() as unknown as PocketBase
    // pb. // [REMOVED] collection.mockReturnValue({ getFullList: listMock })
    const contas = await getBankAccountsByTenant(pb, 'cli1')
    expect(// pb. // [REMOVED] collection).toHaveBeenCalledWith('clientes_contas_bancarias')
    expect(listMock).toHaveBeenCalledWith({ filter: "cliente='cli1'" })
    expect(contas[0].id).toBe('1')
  })

  it('retorna lista tipada', async () => {
    const listMock = vi
      .fn()
      .mockResolvedValue([
        { id: '1', accountName: 'Conta', ownerName: 'Fulano' },
      ])
    const pb = createPocketBaseMock() as unknown as PocketBase
    // pb. // [REMOVED] collection.mockReturnValue({ getFullList: listMock })
    const contas = await getBankAccountsByTenant(pb, 'cli1')
    expectTypeOf(contas).toEqualTypeOf<ClienteContaBancariaRecord[]>()
    expect(contas[0].accountName).toBe('Conta')
  })
})
