import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'asaas.com',
      'umadeus-production.up.railway.app',
      'images.unsplash.com',
      'picsum.photos',
    ],
  },
  redirects: async () => [
    {
      source: '/inscricao',
      destination: '/loja/eventos',
      permanent: true,
    },
  ],
  rewrites: async () => [],
}

export default nextConfig
