'use client'

import { EventForm } from '@/components/organisms'

export default function EventosFormPage() {
  return (
    <main className="px-4 py-10 flex justify-center">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Inscrição em Evento</h1>
        <EventForm />
      </div>
    </main>
  )
}
