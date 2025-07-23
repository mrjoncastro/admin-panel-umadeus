// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { processWebhook } from '@/lib/webhookProcessor'
import { logConciliacaoErro } from '@/lib/server/logger'

export const config = { runtime: 'nodejs' }

export async function GET(): Promise<NextResponse> {
  // const pb = createPocketBase() // [REMOVED]
  if (!// pb. // [REMOVED] authStore.isValid) {
    await // pb. // [REMOVED] admins.authWithPassword(
      process.env.// PB_ADMIN_EMAIL // [REMOVED]!,
      process.env.// PB_ADMIN_PASSWORD // [REMOVED]!,
    )
  }

  const now = new Date().toISOString()
  const { items: tasks } = await // pb. // [REMOVED] collection('webhook_tasks').getList(1, 20, {
    filter: `status="pending" || (status="failed" && next_retry <= "${now}")`,
    sort: 'created',
  })

  for (const task of tasks) {
    await // pb. // [REMOVED] collection('webhook_tasks').update(task.id, {
      status: 'processing',
      attempts: task.attempts + 1,
      updated: new Date().toISOString(),
    })

    try {
      const data = JSON.parse(task.payload)
      await processWebhook(data)
      await // pb. // [REMOVED] collection('webhook_tasks').update(task.id, {
        status: 'done',
        updated: new Date().toISOString(),
      })
    } catch (error) {
      const willRetry = task.attempts + 1 < task.max_attempts
      await // pb. // [REMOVED] collection('webhook_tasks').update(task.id, {
        status: willRetry ? 'failed' : 'done',
        error: String(error).substring(0, 200),
        next_retry: willRetry
          ? new Date(Date.now() + 5 * 60 * 1000).toISOString()
          : null,
        updated: new Date().toISOString(),
      })
      await logConciliacaoErro(
        `Task ${task.id} falhou na tentativa ${task.attempts + 1}: ${error}`,
      )
    }
  }

  return NextResponse.json({ processed: tasks.length })
}
