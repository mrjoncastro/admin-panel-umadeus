'use client'
import dynamic from 'next/dynamic'

const BlogClient = dynamic(() => import('./BlogClient'), { ssr: false })
export default BlogClient
