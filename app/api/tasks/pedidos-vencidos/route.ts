import { NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { pbRetry } from '@/lib/pbRetry'

export const config = { runtime: 'nodejs' }

export async function GET(): Promise<NextResponse> {
  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  const now = new Date().toISOString()
  const pendentes = await pbRetry(() =>
    pb.collection('pedidos').getFullList(200, {
      filter: `status='pendente' && vencimento != '' && vencimento < "${now}"`,
    }),
  )

  for (const pedido of pendentes) {
    await pb.collection('pedidos').update(pedido.id, { status: 'vencido' })
  }

  return NextResponse.json({ atualizados: pendentes.length })
}
