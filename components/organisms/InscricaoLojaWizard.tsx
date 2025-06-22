'use client'
import EventForm from './EventForm'

interface InscricaoLojaWizardProps {
  eventoId: string
}

export default function InscricaoLojaWizard({
  eventoId,
}: InscricaoLojaWizardProps) {
  return <EventForm eventoId={eventoId} />
}
