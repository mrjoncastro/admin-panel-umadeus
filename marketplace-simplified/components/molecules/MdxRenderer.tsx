// app/blog/post/[slug]/MdxRenderer.tsx
'use client'

import { ComponentType } from 'react'

export default function MdxRenderer({
  Component,
}: {
  Component: ComponentType
}) {
  return (
    <article className="prose prose-blue max-w-none">
      <Component />
    </article>
  )
}
