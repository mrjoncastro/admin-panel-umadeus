export interface Bank {
  ispb: string;
  name: string;
  code: number;
  fullName?: string;
}

export async function searchBanks(query: string, fetchFn: typeof fetch = fetch): Promise<Bank[]> {
  if (!query) return [];
  const base = process.env.NEXT_PUBLIC_BRASILAPI_URL || '';
  const url = `${base}/api/banks/v1?search=${encodeURIComponent(query)}`;
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error('Erro ao consultar bancos');
  }
  return (await res.json()) as Bank[];
}

import type PocketBase from 'pocketbase';

export interface BankAccount {
  ownerName: string;
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

export interface ClienteContaBancariaRecord {
  id: string;
  accountName: string;
  ownerName: string;
}

export async function getBankAccountsByTenant(
  pb: PocketBase,
  tenantId: string
) {
  return pb
    .collection('clientes_contas_bancarias')
    .getFullList<ClienteContaBancariaRecord>({
      filter: `cliente='${tenantId}'`,
      sort: 'accountName',
    });
}
