// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { PostRecord } from '@/lib/posts/getPostsFromPB'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.pathname.split('/').pop() ?? ''
  if (!slug) {
    return NextResponse.json({ error: 'Slug ausente' }, { status: 400 })
  }
  // const pb = createPocketBase() // [REMOVED]
  const tenantId = await getTenantFromHost()
  try {
    const post = await pb
      .collection('posts')
      .getFirstListItem<PostRecord>(`slug='${slug}' && cliente='${tenantId}'`)
    return NextResponse.json({
      ...post,
      thumbnail: post.thumbnail ? // pb. // [REMOVED] files.getUrl(post, post.thumbnail) : null,
    })
  } catch {
    return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
  }
}
