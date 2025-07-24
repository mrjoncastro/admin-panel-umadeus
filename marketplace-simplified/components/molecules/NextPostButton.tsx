'use client'

import { ChevronRight } from 'lucide-react'

interface NextPostButtonProps {
  slug: string
}

export default function NextPostButton({ slug }: NextPostButtonProps) {
  return (
    <div className="mt-12 text-center">
      <a
        href={`/blog/post/${slug}`}
        className="inline-flex items-center justify-center w-10 h-10 bg-neutral-100 rounded-full hover:bg-primary-600 hover:text-white transition"
        aria-label="Próxima postagem"
      >
        <ChevronRight size={20} />
      </a>
    </div>
  )
}
