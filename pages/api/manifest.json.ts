import { NextRequest, NextResponse } from 'next/server'
import { UAParser } from 'ua-parser-js'
import PocketBase from 'pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'

export const config = { runtime: 'edge' }

// TTL de 300 segundos
const TTL = 300_000

interface ManifestConfig {
  logo?: string
  name?: string
  short_name?: string
  description?: string
  theme_color?: string
  background_color?: string
  start_url?: string
  display_default?: string
  orientation_default?: string
  updated: string
  [key: string]: unknown
}

type CacheEntry = {
  manifest: Record<string, unknown>
  etag: string
  expires: number
}

const cache = new Map<string, CacheEntry>()

export default async function handler(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0] ?? ''
  if (!host) {
    return new NextResponse('Host header missing', { status: 400 })
  }

  const ifNoneMatch = req.headers.get('if-none-match') || ''

  const cached = cache.get(host)
  if (cached && cached.expires > Date.now()) {
    if (ifNoneMatch === cached.etag) {
      return new NextResponse(null, { status: 304 })
    }
    return new NextResponse(JSON.stringify(cached.manifest), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control':
          'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        ETag: cached.etag,
      },
    })
  }

  try {
    const pb = new PocketBase(process.env.PB_URL)
    const adminToken = process.env.PB_ADMIN_TOKEN
    if (adminToken) {
      pb.authStore.save(adminToken, null)
      try {
        await pb.admins.authRefresh()
      } catch {
        pb.authStore.clear()
      }
    }

    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem<ManifestConfig>(`dominio='${host}'`)

    if (!cfg) {
      return new NextResponse(null, { status: 404 })
    }

    const ua = req.headers.get('user-agent') || ''
    const parser = new UAParser(ua)
    const detected = parser.getDevice().type as 'mobile' | 'tablet' | 'desktop' | undefined
    const deviceType = detected || 'desktop'

    const logoBase = cfg.logo
      ? pb.files.getUrl(cfg as unknown as { [key: string]: unknown }, cfg.logo)
      : ''
    const icons: { src: string; sizes: string; type: string; purpose?: string }[] = []

    if (deviceType === 'mobile') {
      for (const size of [192, 512]) {
        icons.push({
          src: `${logoBase}?w=${size}&h=${size}`,
          sizes: `${size}x${size}`,
          type: 'image/png',
          purpose: 'maskable',
        })
      }
    } else {
      for (const size of [128, 256]) {
        icons.push({
          src: `${logoBase}?w=${size}&h=${size}`,
          sizes: `${size}x${size}`,
          type: 'image/png',
        })
      }
    }

    const display =
      deviceType === 'mobile' ? 'standalone' : cfg.display_default || 'browser'
    const orientation =
      deviceType === 'tablet' ? 'landscape' : cfg.orientation_default || 'portrait'
    const start_url = cfg.start_url ?? (deviceType === 'desktop' ? '/dashboard' : '/')

    const manifest = {
      name: cfg.name,
      short_name: cfg.short_name,
      description: cfg.description,
      start_url,
      display,
      orientation,
      background_color: cfg.background_color,
      theme_color: cfg.theme_color,
      icons,
    }

    const etag = `"${cfg.updated}"`
    cache.set(host, { manifest, etag, expires: Date.now() + TTL })

    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    return new NextResponse(JSON.stringify(manifest), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control':
          'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        ETag: etag,
      },
    })
  } catch (err) {
    await logConciliacaoErro(`[manifest.json] erro: ${String(err)}`)
    return new NextResponse(null, { status: 500 })
  }
}
