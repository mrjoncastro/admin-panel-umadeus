const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

// Usa o host configurado para o tenant ou mantém o domínio padrão
const BASE_URL = process.env.TENANT_HOST || process.env.NEXT_PUBLIC_SITE_URL || 'https://m24saude.com.br' // sem barra no final

function getStaticRoutes() {
  const appDir = path.join(process.cwd(), 'app')
  const ignore = ['layout.tsx', 'not-found.tsx', '_middleware.ts', '_app.tsx']

  function walkDir(dir, baseRoute = '') {
    return fs.readdirSync(dir).flatMap((file) => {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory() && !['api', 'public'].includes(file)) {
        return walkDir(fullPath, `${baseRoute}/${file}`)
      }

      if (
        file.endsWith('.tsx') &&
        !file.startsWith('[') &&
        !ignore.includes(file)
      ) {
        const route = baseRoute || '/'
        return [route.replace(/\/page$/, '')]
      }

      return []
    })
  }

  const routes = walkDir(appDir)

  return [
    ...new Set(
      routes
        .map((r) => r.replace(/\/$/, '') || '/')
        .filter((r) => !r.includes('[')),
    ),
  ]
}

function getBlogPostRoutes() {
  const postsDir = path.join(process.cwd(), 'posts')
  if (!fs.existsSync(postsDir)) return []

  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const filePath = path.join(postsDir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(raw)

      return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        summary: data.summary || '',
      }
    })
}

function sanitizeDate(dateString) {
  try {
    if (!dateString) return new Date().toISOString().split('T')[0]

    // Ex: "15/05/2025, 14:10:40"
    if (dateString.includes('/')) {
      const [d, m, yAndTime] = dateString.split('/')
      const [y, time] = yAndTime.split(',')
      const iso = `${y.trim()}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
      const date = time ? `${iso}T${time.trim()}:00Z` : `${iso}`
      return new Date(date).toISOString().split('T')[0]
    }

    return new Date(dateString).toISOString().split('T')[0]
  } catch (e) {
    console.warn('⚠️ Data inválida encontrada:', dateString)
    return new Date().toISOString().split('T')[0]
  }
}

function generateSitemap(routes, blogPosts) {
  const blogPostMap = new Map(
    blogPosts.map((post) => [`/blog/post/${post.slug}`, post.date]),
  )

  const priorityMap = {
    '/': '1.0',
    '/blog': '0.9',
    '/checkout': '0.8',
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    const cleanUrl = `${BASE_URL}${route}`.replace(/([^:]\/)\/+/g, '$1')
    const lastmodRaw = blogPostMap.get(route)
    const lastmod = sanitizeDate(lastmodRaw)
    const priority =
      priorityMap[route] || (route.startsWith('/blog/post/') ? '0.7' : '0.5')
    const changefreq =
      route === '/' ? 'daily' : route.startsWith('/blog') ? 'weekly' : 'monthly'

    return `  <url>
    <loc>${cleanUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  })
  .join('\n')}
</urlset>`

  fs.writeFileSync(path.join('public', 'sitemap.xml'), sitemap)
  console.log(
    `✅ sitemap.xml gerado com ${routes.length} URLs e datas validadas`,
  )
}

function generateRobotsTxt() {
  const content = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/rss.xml
`
  fs.writeFileSync(path.join('public', 'robots.txt'), content)
  console.log('✅ robots.txt gerado')
}

function generateRSS(posts) {
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Blog M24 Saúde</title>
  <link>${BASE_URL}/blog</link>
  <description>Conteúdo e novidades da M24 Saúde</description>
  <language>pt-BR</language>
  ${posts
    .map((post) => {
      const url = `${BASE_URL}/blog/post/${post.slug}`
      const pubDate = sanitizeDate(post.date)
      return `<item>
  <title>${post.title}</title>
  <link>${url}</link>
  <guid>${url}</guid>
  <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
  <description><![CDATA[${post.summary}]]></description>
</item>`
    })
    .join('\n')}
</channel>
</rss>`

  fs.writeFileSync(path.join('public', 'rss.xml'), rss)
  console.log(`✅ rss.xml gerado com ${posts.length} posts`)
}

function main() {
  const staticRoutes = getStaticRoutes()
  const blogPosts = getBlogPostRoutes()
  const blogRoutes = blogPosts.map((p) => `/blog/post/${p.slug}`)
  const allRoutes = [...staticRoutes, ...blogRoutes]

  generateSitemap(allRoutes, blogPosts)
  generateRobotsTxt()
  generateRSS(blogPosts)
}

main()
