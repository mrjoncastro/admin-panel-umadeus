import { getBlockComponent, type BlockType } from '@/lib/block-factory'
import { headers } from 'next/headers'

export const revalidate = 60

interface HomeSection {
  id: string
  type: BlockType
  props?: Record<string, unknown>
}

export default async function LojaPage() {
  const host = (await headers()).get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const res = await fetch(`${protocol}://${host}/api/home-sections`, {
    next: { revalidate: 60 },
  })
  const sections: HomeSection[] = await res.json()

  return (
    <>
      {sections.map((sec) => {
        const Comp = getBlockComponent(sec.type)
        return Comp ? <Comp key={sec.id} {...(sec.props || {})} /> : null
      })}
    </>
  )
}
