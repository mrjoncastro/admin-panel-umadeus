import dynamic from 'next/dynamic'

const blockMap = {
  hero: dynamic(() => import('@/components/blocks/HeroBlock')),
  featuredProducts: dynamic(() => import('@/components/blocks/FeaturedProducts')),
  welcomingPhrase: dynamic(() => import('@/components/blocks/WelcomingPhrase')),
}

export type BlockType = keyof typeof blockMap

export function getBlockComponent(type: BlockType) {
  return blockMap[type] ?? null
}
