import { NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { PostRecord } from '@/lib/posts/getPostsFromPB'

export async function GET() {
  const pb = createPocketBase()
  const tenantId = await getTenantFromHost()
  try {
    const records = await pb.collection('posts').getFullList<PostRecord>({
      sort: '-date',
      filter: tenantId ? `cliente='${tenantId}'` : undefined,
    })
    const result = records.map((r) => ({
      ...r,
      thumbnail: r.thumbnail ? pb.files.getUrl(r, r.thumbnail) : null,
    }))
    return NextResponse.json(result, { status: 200 })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}

