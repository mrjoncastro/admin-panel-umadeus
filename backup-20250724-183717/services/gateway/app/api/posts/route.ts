// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { PostRecord } from '@/lib/posts/getPostsFromPB'

export async function GET() {
  // const pb = createPocketBase() // [REMOVED]
  const tenantId = await getTenantFromHost()
  try {
    const records = await // pb. // [REMOVED] collection('posts').getFullList<PostRecord>({
      sort: '-date',
      filter: tenantId ? `cliente='${tenantId}'` : undefined,
    })
    const result = records.map((r) => ({
      ...r,
      thumbnail: r.thumbnail ? // pb. // [REMOVED] files.getUrl(r, r.thumbnail) : null,
    }))
    return NextResponse.json(result, { status: 200 })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
