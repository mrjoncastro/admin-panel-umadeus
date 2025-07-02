import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'

export async function POST(req: NextRequest) {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  await pb.collection('webhook_tasks').create({
    event: (payload as any).event ?? 'unknown',
    payload: JSON.stringify(payload),
    status: 'pending',
    attempts: 0,
    max_attempts: 5,
  })

  return NextResponse.json({ status: 'ack' })
}
