'use client'

import { useCart } from '@/lib/context/CartContext'
import { useRouter } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import { CheckCircle } from 'lucide-react'
import { hexToPtName } from '@/utils/colorNamePt'
import { calculateGross, calculateNet, PaymentMethod } from '@/lib/asaasFees'
import {
  MAX_ITEM_DESCRIPTION_LENGTH,
  MAX_ITEM_NAME_LENGTH,
} from '@/lib/constants'
import { useMemo } from 'react'
import type { Produto } from '@/types'

function formatCurrency(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}

function CheckoutContent() {
  const { itens, clearCart } = useCart()

  const router = useRouter()
  const { isLoggedIn, user, tenantId } = useAuthContext()
  const { showSuccess, showError } = useToast()

  const [nome, setNome] = useState(user?.nome || '')
  const [telefone, setTelefone] = useState(String(user?.telefone ?? ''))
  const [email, setEmail] = useState(user?.email || '')
  const [endereco, setEndereco] = useState(String(user?.endereco ?? ''))
  const [cpf, setCpf] = useState('')
  const [estado, setEstado] = useState('')
  const [cep, setCep] = useState('')
  const [cidade, setCidade] = useState('')
  const [numero, setNumero] = useState(String(user?.numero ?? ''))

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [installments, setInstallments] = useState(1)
  const [redirecting, setRedirecting] = useState(false)
  const [campoId, setCampoId] = useState<string | null>(null)

  // 1. calcula total líquido
  const total = useMemo(
    () => itens.reduce((sum, i) => sum + i.preco * i.quantidade, 0),
    [itens],
  )

  // 2. calcula total bruto
  const totalGross = useMemo(
    () => calculateGross(total, paymentMethod, installments).gross,
    [total, paymentMethod, installments],
  )

  // 3️⃣ calcula o subtotal bruto somando o bruto de cada item
  const displayTotalGross = useMemo(() => {
    return itens.reduce(
      (sum, i) =>
        sum +
        calculateGross(i.preco, paymentMethod, installments).gross *
          i.quantidade,
      0,
    )
  }, [itens, paymentMethod, installments])

  useEffect(() => {
    if (user) {
      setNome(user.nome || '')
      setTelefone(String(user.telefone ?? ''))
      setEmail(user.email || '')
      setEndereco(String(user.endereco ?? ''))
      setNumero(String(user.numero ?? ''))
      setEstado(String(user.estado ?? ''))
      setCep(String(user.cep ?? ''))
      setCidade(String(user.cidade ?? ''))
      setCpf(String(user.cpf ?? ''))
    }
  }, [user])

  useEffect(() => {
    if (!user?.id) return
    let ignore = false
    fetch(`/api/usuarios/${user.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u) => {
        if (ignore) return
        const campo =
          (u.expand?.campo as { id?: string; responsavel?: string }) || {}
        setCampoId((u as { campo?: string }).campo || campo.id || null)
      })
      .catch(() => {
        /* ignore */
      })
    return () => {
      ignore = true
    }
  }, [user?.id])

  useEffect(() => {}, [total, paymentMethod, installments])

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login?redirect=/loja/checkout')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    if (paymentMethod !== 'credito' && installments !== 1) {
      setInstallments(1)
    }
  }, [paymentMethod, installments])

  function maskTelefone(valor: string) {
    // Remove tudo que não for número
    let v = valor.replace(/\D/g, '')
    // (99) 99999-9999 ou (99) 9999-9999
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 10) {
      // Celular com 9 dígitos
      return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    } else if (v.length > 6) {
      // Fixo ou celular antigo
      return v.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3')
    } else if (v.length > 2) {
      return v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2')
    } else {
      return v
    }
  }

  const handleConfirm = async () => {
    setStatus('loading')
    try {
      const itensPayload = await Promise.all(
        itens.map(async (i) => {
          let fotoBase64: string | undefined
          if (i.imagem) {
            try {
              const resp = await fetch(i.imagem)
              const blob = await resp.blob()
              fotoBase64 = await new Promise((res) => {
                const reader = new FileReader()
                reader.onloadend = () => res(reader.result as string)
                reader.readAsDataURL(blob)
              })
            } catch {
              /* ignore */
            }
          }
          const grossUnit = calculateGross(
            i.preco,
            paymentMethod,
            installments,
          ).gross
          return {
            name: i.nome.slice(0, MAX_ITEM_NAME_LENGTH),
            description: i.descricao?.slice(0, MAX_ITEM_DESCRIPTION_LENGTH),
            quantity: i.quantidade,
            value: grossUnit,
            fotoBase64,
          }
        }),
      )

      if (!tenantId || !user?.id) {
        throw new Error('Autenticação inválida')
      }

      const paymentMap = {
        pix: 'PIX',
        boleto: 'BOLETO',
        credito: 'CREDIT_CARD',
      } as const

      const { net: valorBruto } = calculateNet(
        displayTotalGross,
        paymentMethod,
        installments,
      )

      type LegacyItem = Produto & {
        tamanho?: string
        cor?: string
        genero?: string
      }

      const firstItem = itens[0] as LegacyItem

      const pedidoRes = await fetch('/api/pedidos', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto: firstItem?.nome || 'Produto',
          tamanho: Array.isArray(firstItem?.tamanhos)
            ? firstItem.tamanhos[0]
            : firstItem.tamanho,
          cor: Array.isArray(firstItem?.cores)
            ? firstItem.cores[0] || 'Roxo'
            : firstItem.cor || 'Roxo',
          genero: Array.isArray(firstItem?.generos)
            ? firstItem.generos[0]
            : firstItem.genero,
          campoId,
          email,
          valor: displayTotalGross.toFixed(2),
        }),
      })
      const pedidoData = await pedidoRes.json()
      if (!pedidoRes.ok) throw new Error('Erro ao criar pedido')

      const payload = {
        valorBruto,
        paymentMethod,
        itens: itensPayload,
        successUrl: `${window.location.origin}/loja/sucesso?pedido=${pedidoData.pedidoId}`,
        errorUrl: `${window.location.origin}/loja/sucesso?pedido=${pedidoData.pedidoId}`,
        clienteId: tenantId,
        usuarioId: user.id,
        cliente: {
          nome,
          email,
          telefone,
          cpf,
          endereco,
          numero,
          estado,
          cep,
          cidade,
        },
        installments,
        paymentMethods: [paymentMap[paymentMethod]],
        ...(paymentMethod === 'credito' && installments > 1
          ? {
              chargeTypes: ['INSTALLMENT'],
              installment: { maxInstallmentCount: installments },
            }
          : {}),
      }

      const res = await fetch('/api/asaas/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      const link = data?.checkoutUrl || data?.link
      if (!res.ok || !link) throw new Error('Falha ao gerar link de pagamento')
      setRedirecting(true)
      showSuccess(
        'Pedido registrado! Você será redirecionado para o pagamento.',
      )
      clearCart()
      setTimeout(() => {
        setStatus('success')
        setTimeout(() => {
          window.location.href = link
        }, 1000)
      }, 1000)
    } catch {
      showError('Erro ao processar pagamento. Tente novamente.')
      setStatus('idle')
    }
  }

  if (itens.length === 0) {
    if (redirecting) {
      return (
        <LoadingOverlay show text="Encaminhando para a área de pagamento..." />
      )
    }

    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-semibold mb-4 tracking-tight">
          Seu carrinho está vazio
        </h1>
        <button
          onClick={() => router.push('/loja')}
          className="text-sm underline mt-2"
        >
          Voltar à loja
        </button>
      </main>
    )
  }

  return (
    <>
      <LoadingOverlay show={redirecting} text="Redirecionando..." />
      <main className="min-h-[80vh] flex justify-center items-center py-8">
        <div className="w-full max-w-5xl bg-neutral-50 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10 p-6 md:p-12">
          {/* Bloco ESQUERDO: Info de entrega */}
          <section>
            <h2 className="text-lg font-semibold mb-6 tracking-tight">
              Informações de entrega
            </h2>
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault()
                handleConfirm()
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                    placeholder="(00) 90000-0000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={typeof email === 'string' ? email : ''}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                  placeholder="Seu melhor e-mail"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={typeof endereco === 'string' ? endereco : ''}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                  placeholder="Rua"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                  placeholder="Número"
                  required
                />
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                  placeholder="Estado"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                  placeholder="CEP"
                  required
                />
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                  placeholder="Cidade"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                  placeholder="CPF"
                  required
                />
              </div>
            </form>
          </section>
          {/* Bloco DIREITO: Resumo do pedido */}
          <section>
            <h2 className="text-lg font-semibold mb-6 tracking-tight">
              Resumo do pedido
            </h2>
            <ul className="divide-y divide-gray-100 mb-5">
              {itens.map((item) => (
                <li
                  key={item.variationId}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <div className="font-medium">{item.nome}</div>
                    <div className="text-xs text-gray-400">
                      Modelo: {item.generos?.[0] || '-'} | Tamanho:{' '}
                      {item.tamanhos?.[0] || '-'} | Cor:{' '}
                      {item.cores?.[0] ? hexToPtName(item.cores[0]) : '-'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Qtd: {item.quantidade}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(
                      calculateGross(item.preco, paymentMethod, installments)
                        .gross * item.quantidade,
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                {/* TOTAL do carrinho em bruto */}
                <span>{formatCurrency(displayTotalGross)}</span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Forma de pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  <option value="pix">Pix</option>
                  <option value="boleto">Boleto</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Parcelas
                </label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  disabled={paymentMethod !== 'credito'}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}x
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-t pt-4 space-y-1">
              <div className="flex justify-between text-base">
                <span>Total a pagar</span>
                <span>{formatCurrency(totalGross)}</span>
              </div>
              {paymentMethod === 'credito' && installments > 1 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Valor da parcela</span>
                  <span>{formatCurrency(totalGross / installments)}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleConfirm}
              disabled={status !== 'idle'}
              className="mt-8 w-full py-3 rounded-xl bg-primary-600 text-white font-medium text-base tracking-wide transition hover:bg-primary-900 active:scale-95 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processando...
                </span>
              ) : status === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                'Confirmar Pedido'
              )}
            </button>
          </section>
        </div>
      </main>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}
