import { NextRequest, NextResponse } from 'next/server'
import { logConciliacaoErro } from '@/lib/server/logger'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl
  const slug = pathname.split('/').pop() ?? ''

  if (!slug) {
    return NextResponse.json(
      { error: 'Slug ausente ou inválido.' },
      { status: 400 },
    )
  }

  const pb = createPocketBase()
  const tenantId = await getTenantFromHost()

  try {
    const post = await pb
      .collection('posts')
      .getFirstListItem(`slug='${slug}' && cliente='${tenantId}'`)

    const keywords = Array.isArray(post.keywords)
      ? post.keywords.join(', ')
      : (post.keywords ?? '')

    return NextResponse.json({
      title: post.title ?? '',
      summary: post.summary ?? '',
      category: post.category ?? '',
      date: post.date ?? '',
      thumbnail: post.thumbnail ?? '',
      keywords,
      content: post.content ?? '',
    })
  } catch (err) {
    await logConciliacaoErro(`Erro ao carregar post: ${String(err)}`)
    return NextResponse.json(
      { error: 'Erro ao carregar post.' },
      { status: 500 },
    )
  }
}
