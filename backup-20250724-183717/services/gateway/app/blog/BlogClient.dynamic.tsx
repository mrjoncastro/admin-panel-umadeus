'use client'
import dynamic from 'next/dynamic'

const BlogClient = dynamic(() => import('@/components/organisms/BlogClient'), {
  ssr: false,
})

export default BlogClient
