'use client'

import { useParams } from 'next/navigation'
import { InscricaoWizard } from '@/components/organisms'

export default function InscricaoPage() {
  const params = useParams()
  const liderId = params.liderId as string
  const eventoId = params.eventoId as string

  return (
    <div className="py-10">
      <InscricaoWizard liderId={liderId} eventoId={eventoId} />
    </div>
  )
}
