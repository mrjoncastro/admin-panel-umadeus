'use client'

import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useState, useEffect } from 'react'
import { useToast } from '@/lib/context/ToastContext'
import TransferenciaForm from '@/app/admin/financeiro/transferencias/components/TransferenciaForm'
import BankAccountModal from '@/app/admin/financeiro/transferencias/modals/BankAccountModal'
import type { PixKeyRecord } from '@/lib/bankAccounts'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export default function TransferenciasPage() {
  const { isLoggedIn } = useAuthContext()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { user, pb, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const [openAccountModal, setOpenAccountModal] = useState(false)

  if (!authChecked) return null

  async function handleTransfer(
    destino: string,
    valor: number,
    description: string,
    isPix: boolean,
    pixKey?: PixKeyRecord,
  ) {
    const payload: Record<string, unknown> = { value: valor }
    if (isPix && pixKey) {
      payload.operationType = 'PIX'
      payload.pixAddressKey = pixKey.pixAddressKey
      payload.pixAddressKeyType = pixKey.pixAddressKeyType
      if (description) payload.description = description
      const schedule = (pixKey as Record<string, unknown>).scheduleDate
      if (typeof schedule === 'string' && schedule) {
        payload.scheduleDate = schedule
      }
    } else {
      payload.bankAccountId = destino
      if (description) payload.description = description
    }
    const res = await fetch('/admin/api/asaas/transferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      showSuccess('Transferência enviada!')
    } else {
      showError('Erro ao transferir.')
    }
  }

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login')
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h2 className="heading mb-6">Transferências</h2>
      <button
        type="button"
        className="btn btn-secondary mb-4"
        onClick={() => setOpenAccountModal(true)}
      >
        Nova conta
      </button>
      <TransferenciaForm onTransfer={handleTransfer} />
      <BankAccountModal
        open={openAccountModal}
        onClose={() => setOpenAccountModal(false)}
      />
    </main>
  )
}
