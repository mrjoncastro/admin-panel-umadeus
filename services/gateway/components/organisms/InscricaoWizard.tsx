'use client'
import EventForm from './EventForm'

interface InscricaoWizardProps {
  liderId: string
  eventoId: string
}

export default function InscricaoWizard({
  liderId,
  eventoId,
}: InscricaoWizardProps) {
  return <EventForm eventoId={eventoId} liderId={liderId} />
}
