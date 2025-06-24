import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  try {
    revalidatePath('/loja')
    return NextResponse.json({ revalidated: true })
  } catch (err) {
    console.error('Erro ao revalidar loja:', err)
    return NextResponse.json({ error: 'Erro ao revalidar' }, { status: 500 })
  }
}
