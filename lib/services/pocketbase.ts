import type PocketBase from 'pocketbase';
import createPocketBase from '../pocketbase';

function getClient(pb?: PocketBase): PocketBase {
  return pb ?? createPocketBase();
}

export async function fetchInscricoes(tenantId: string, pb?: PocketBase) {
  const client = getClient(pb);
  return client.collection('inscricoes').getFullList({
    filter: `tenant_id = "${tenantId}"`,
  });
}

export async function fetchProdutos(tenantId: string, pb?: PocketBase) {
  const client = getClient(pb);
  return client.collection('produtos').getFullList({
    filter: `tenant_id = "${tenantId}"`,
  });
}

export async function fetchUsuario(
  pb: PocketBase,
  id: string,
  tenantId: string
) {
  const usuario = await pb.collection('usuarios').getOne(id, { expand: 'campo' });
  if ((usuario as { cliente?: string }).cliente !== tenantId) {
    throw new Error('TENANT_MISMATCH');
  }
  return usuario;
}
