export interface Bank {
  ispb: string;
  name: string;
  code: number;
  fullName?: string;
}

export async function searchBanks(query: string, fetchFn: typeof fetch = fetch): Promise<Bank[]> {
  const base = process.env.NEXT_PUBLIC_BRASILAPI_URL || '';
  const url = query
    ? `${base}/api/banks/v1?search=${encodeURIComponent(query)}`
    : `${base}/api/banks/v1`;
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error('Erro ao consultar bancos');
  }
  const data = (await res.json()) as Bank[];
  return query ? data : data.slice(0, 15);
}

import type PocketBase from 'pocketbase';

export interface BankAccount {
  ownerName: string;
  accountName: string;
  cpfCnpj: string;
  ownerBirthDate: string;
  bankName: string;
  bankCode: string;
  ispb: string;
  agency: string;
  account: string;
  accountDigit: string;
  bankAccountType: string;
}

export async function createBankAccount(
  pb: PocketBase,
  account: BankAccount,
  userId: string,
  clienteId: string
) {
  const data = {
    ...account,
    usuario: userId,
    cliente: clienteId,
  };
  return pb.collection('clientes_contas_bancarias').create(data);
}

export async function getBankAccountsByTenant(
  pb: PocketBase,
  tenantId: string
) {
  return pb
    .collection('clientes_contas_bancarias')
    .getFullList({ filter: `cliente='${tenantId}'` });
}
