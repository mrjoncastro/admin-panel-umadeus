export interface Bank {
  ispb: string
  name: string
  code: number
  fullName?: string
}

export async function searchBanks(
  query: string,
  fetchFn: typeof fetch = fetch,
): Promise<Bank[]> {
  const base = process.env.NEXT_PUBLIC_BRASILAPI_URL || ''
  const url = query
    ? `${base}/api/banks/v1?search=${encodeURIComponent(query)}`
    : `${base}/api/banks/v1`
  const res = await fetchFn(url)
  if (!res.ok) {
    throw new Error('Erro ao consultar bancos')
  }
  const data = (await res.json()) as Bank[]
  return query ? data : data.slice(0, 15)
}

import type PocketBase from 'pocketbase'

export interface BankAccount {
  ownerName: string
  accountName: string
  cpfCnpj: string
  ownerBirthDate: string
  bankName: string
  bankCode: string
  ispb: string
  agency: string
  account: string
  accountDigit: string
  bankAccountType: string
}

export interface ClienteContaBancariaRecord {
  id: string
  accountName: string
  ownerName: string
  [key: string]: unknown
}

export async function createBankAccount(
  pb: PocketBase,
  account: BankAccount,
  userId: string,
  clienteId: string,
) {
  const data = {
    ...account,
    usuario: userId,
    cliente: clienteId,
  }
  return pb.collection('clientes_contas_bancarias').create(data)
}

export interface PixKey {
  pixAddressKey: string
  pixAddressKeyType: string
  description: string
  scheduleDate: string
}

export async function createPixKey(
  pb: PocketBase,
  pix: PixKey,
  userId: string,
  clienteId: string,
) {
  const data = {
    ...pix,
    usuario: userId,
    cliente: clienteId,
  }
  return pb.collection('clientes_pix').create(data)
}

export interface PixKeyRecord {
  id: string
  pixAddressKey: string
  pixAddressKeyType: string
  [key: string]: unknown
}

export async function getPixKeysByTenant(
  pb: PocketBase,
  tenantId: string,
): Promise<PixKeyRecord[]> {
  return pb
    .collection('clientes_pix')
    .getFullList({ filter: `cliente='${tenantId}'` }) as Promise<PixKeyRecord[]>
}

export async function getBankAccountsByTenant(
  pb: PocketBase,
  tenantId: string,
): Promise<ClienteContaBancariaRecord[]> {
  return pb
    .collection('clientes_contas_bancarias')
    .getFullList({ filter: `cliente='${tenantId}'` }) as Promise<
    ClienteContaBancariaRecord[]
  >
}

export async function fetchBankAccounts(
  fetchFn: typeof fetch = fetch,
): Promise<ClienteContaBancariaRecord[]> {
  const res = await fetchFn('/admin/api/bank-accounts')
  if (!res.ok) {
    throw new Error('Erro ao listar contas')
  }
  return (await res.json()) as ClienteContaBancariaRecord[]
}

export async function fetchPixKeys(
  fetchFn: typeof fetch = fetch,
): Promise<PixKeyRecord[]> {
  const res = await fetchFn('/admin/api/pix-keys')
  if (!res.ok) {
    throw new Error('Erro ao listar pix')
  }
  return (await res.json()) as PixKeyRecord[]
}

export async function createBankAccountApi(
  account: BankAccount,
  fetchFn: typeof fetch = fetch,
) {
  const res = await fetchFn('/admin/api/bank-accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  })
  if (!res.ok) {
    throw new Error('Erro ao criar conta')
  }
  return res.json()
}

export async function createPixKeyApi(
  pix: PixKey,
  fetchFn: typeof fetch = fetch,
) {
  const res = await fetchFn('/admin/api/pix-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pix),
  })
  if (!res.ok) {
    throw new Error('Erro ao criar pix')
  }
  return res.json()
}
