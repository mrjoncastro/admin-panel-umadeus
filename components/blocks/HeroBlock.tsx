'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function HeroBlock() {
  return (
    <section className="w-full bg-primary-900 min-h-[400px] md:min-h-[540px] grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left bg-primary-600 px-8">
        <span className="mb-4 px-4 py-1 bg-white/20 text-white rounded-full text-xs uppercase tracking-wide font-semibold">
          Inscrições abertas!
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-bebas uppercase tracking-wide text-white mb-4">
          Congresso UMADEUS 2K25
        </h1>
        <p className="text-base md:text-lg text-white/90 mb-8 max-w-lg">
          Prepare-se para dias de avivamento, comunhão e crescimento espiritual. Faça já sua inscrição no maior encontro jovem do ano!
        </p>
        <Link
          href="/loja/eventos"
          className="inline-block bg-white text-primary-600 px-8 py-3 rounded-full font-semibold transition text-lg hover:bg-gray-100"
        >
          Inscreva-se agora
        </Link>
      </div>
      <div className="relative w-full h-[300px] md:h-auto">
        <Image
          src="/img/qg3_tech.webp"
          alt="Congresso UMADEUS"
          fill
          style={{ objectFit: 'cover' }}
          className="w-full h-full"
          priority
        />
      </div>
    </section>
  )
}
