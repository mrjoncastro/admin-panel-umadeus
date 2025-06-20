'use client'

import Link from 'next/link'

export default function ConfirmacaoInscricaoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-white to-primary-200 px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-6 border border-primary-300">
        <h1 className="text-3xl font-extrabold text-[var(--accent)]">
          🎉 Inscrição enviada!
        </h1>
        <p className="text-gray-700 text-base leading-relaxed">
          Em breve entraremos em contato com mais informações.
        </p>
        <Link href="/loja" className="btn btn-primary">
          Voltar à loja
        </Link>
        <p className="text-xs text-gray-400 italic mt-6">
          #UMADEUS2025 — Juntos na missão 💜
        </p>
      </div>
    </div>
  )
}
