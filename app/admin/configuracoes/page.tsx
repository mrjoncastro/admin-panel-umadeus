'use client'
import { useState, useRef, ChangeEvent, useCallback } from 'react'
import { useTenant } from '@/lib/context/TenantContext'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import Image from 'next/image'
import { Check } from 'lucide-react'
import ToggleSwitch from '@/components/atoms/ToggleSwitch'

// Lista de tons proibidos (branco, quase branco, preto, quase preto)
const BLOCKED_COLORS = [
  '#fff',
  '#ffffff',
  '#f8f8f8',
  '#f9f9f9',
  '#f7f7f7',
  '#fafafa',
  '#000',
  '#000000',
  '#111',
  '#111111',
  '#1a1a1a',
  '#222',
  '#222222',
]

function isBlockedColor(hex: string) {
  if (!hex) return false
  hex = hex.toLowerCase()
  if (BLOCKED_COLORS.includes(hex)) return true

  // Converte para rgb
  const c = hex.replace('#', '')
  let r = 0,
    g = 0,
    b = 0
  if (c.length === 3) {
    r = parseInt(c[0] + c[0], 16)
    g = parseInt(c[1] + c[1], 16)
    b = parseInt(c[2] + c[2], 16)
  } else if (c.length === 6) {
    r = parseInt(c.substr(0, 2), 16)
    g = parseInt(c.substr(2, 2), 16)
    b = parseInt(c.substr(4, 2), 16)
  }
  // Checa se está muito claro ou muito escuro
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > 245 || luminance < 15
}

// Checa se cor é clara, para ajuste de texto no botão
function isColorLight(hex?: string) {
  if (!hex) return false
  const c = hex.replace('#', '')
  let r = 0,
    g = 0,
    b = 0
  if (c.length === 3) {
    r = parseInt(c[0] + c[0], 16)
    g = parseInt(c[1] + c[1], 16)
    b = parseInt(c[2] + c[2], 16)
  } else if (c.length === 6) {
    r = parseInt(c.substr(0, 2), 16)
    g = parseInt(c.substr(2, 2), 16)
    b = parseInt(c.substr(4, 2), 16)
  }
  return 0.299 * r + 0.587 * g + 0.114 * b > 186
}

const fontes = [
  { label: 'Geist', value: 'var(--font-geist)' },
  { label: 'Bebas Neue', value: 'var(--font-bebas)' },
  { label: 'Arial', value: 'Arial, sans-serif' },
]

export default function ConfiguracoesPage() {
  const { config, updateConfig } = useTenant()
  const { user: ctxUser } = useAuthContext()
  const { showSuccess, showError } = useToast()
  const getAuth = useCallback(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('pb_token') : null
    const raw =
      typeof window !== 'undefined' ? localStorage.getItem('pb_user') : null
    const user = raw ? JSON.parse(raw) : ctxUser
    return { token, user } as const
  }, [ctxUser])
  const [font, setFont] = useState(config.font)
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor)
  const [logoUrl, setLogoUrl] = useState(config.logoUrl)
  const [confirmaInscricoes, setConfirmaInscricoes] = useState(
    config.confirmaInscricoes,
  )
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Preview dinâmico
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--font-body', font)
    document.documentElement.style.setProperty('--font-heading', font)
    document.documentElement.style.setProperty('--accent', primaryColor)
  }

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === 'text') {
      const url = e.target.value
      setLogoUrl(url)
      updateConfig({ logoUrl: url })
      return
    }
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setLogoUrl(url)
      updateConfig({ logoUrl: url })
    }
    reader.readAsDataURL(file)
  }

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setPrimaryColor(color)

    if (isBlockedColor(color)) {
      setError(
        'Por favor, escolha uma cor mais escura ou mais viva (evite branco/preto).',
      )
    } else {
      setError('')
    }
  }

  const handleSave = async () => {
    if (isBlockedColor(primaryColor)) {
      setError('Cor inválida. Escolha uma cor mais escura ou mais viva.')
      return
    }

    const { token, user } = getAuth()
    if (!token || !user) {
      showError('Erro ao salvar configurações')
      return
    }

    try {
      const res = await fetch('/admin/api/configuracoes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-PB-User': JSON.stringify(user),
        },
        body: JSON.stringify({
          cor_primary: primaryColor,
          logo_url: logoUrl,
          font,
          confirma_inscricoes: confirmaInscricoes,
        }),
      })

      if (res.ok) {
        updateConfig({ font, primaryColor, logoUrl, confirmaInscricoes })
        showSuccess('Configurações salvas')
      } else {
        showError('Erro ao salvar configurações')
      }
    } catch (err) {
      console.error('Erro ao salvar configura\u00e7\u00f5es:', err)
      showError('Erro ao salvar configurações')
    }

    setError('')
  }

  const isLight = isColorLight(primaryColor)

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-8 space-y-10 mt-10">
      <div className="space-y-6">
        {/* Fonte */}
        <label className="block">
          <span className="block mb-1 text-base font-semibold text-gray-700 dark:text-gray-200">
            Fonte
          </span>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="input-base rounded-xl border-2 border-purple-100 focus:border-purple-400"
            style={{ fontFamily: font }}
          >
            {fontes.map((f) => (
              <option
                key={f.value}
                value={f.value}
                style={{ fontFamily: f.value }}
              >
                {f.label}
              </option>
            ))}
          </select>
          <span
            className="mt-2 block text-xs text-neutral-500"
            style={{ fontFamily: font }}
          >
            <span className="font-semibold">Prévia:</span> UMADEUS Portal
          </span>
        </label>
        {/* Cor Primária */}
        <label className="block">
          <span className="block mb-1 text-base font-semibold text-gray-700 dark:text-gray-200">
            Cor Primária
          </span>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={primaryColor}
              onChange={handleColorChange}
              className="w-12 h-10 rounded-xl border-2 border-purple-200 shadow-sm focus:border-purple-500 transition"
              style={{ background: primaryColor }}
            />
            <span
              className="text-sm font-mono px-2 py-1 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
              style={{
                color: isLight ? '#444' : '#fff',
                background: isLight ? '#eee' : primaryColor,
              }}
            >
              {primaryColor}
            </span>
          </div>
        </label>
        {error && (
          <div className="text-sm text-red-600 px-2 py-1 bg-red-50 rounded">
            {error}
          </div>
        )}
        {/* Logo */}
        <label className="block">
          <span className="block mb-1 text-base font-semibold text-gray-700 dark:text-gray-200">
            Logo <span className="text-xs text-gray-400">(URL ou Upload)</span>
          </span>
          <input
            type="text"
            value={logoUrl.startsWith('data:') ? '' : logoUrl}
            placeholder="Cole a URL do logo"
            onChange={handleLogoChange}
            className="input-base rounded-xl border-2 border-purple-100 focus:border-purple-400 mb-2"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="input-base rounded-xl border-2 border-purple-100 focus:border-purple-400"
          />
        </label>
        {logoUrl && (
          <div className="flex items-center gap-3 mt-2">
            <div className="h-20 w-20 flex items-center justify-center border-2 border-purple-200 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
              <Image
                src={logoUrl}
                alt="Logo"
                width={64}
                height={64}
                className="h-16 w-auto"
                unoptimized
              />
            </div>
            <span className="text-xs text-neutral-500">Prévia do logo</span>
          </div>
        )}
        {/* Confirmação manual */}
        <ToggleSwitch
          checked={confirmaInscricoes}
          onChange={setConfirmaInscricoes}
          label="Confirmar inscrições manualmente?"
          className="mt-4"
        />
        {/* Preview botão */}
        <div>
          <span className="block mb-1 text-sm text-gray-600">
            Prévia do botão:
          </span>
          <button
            type="button"
            className="btn btn-primary w-40 flex items-center justify-center gap-2 rounded-2xl shadow-lg"
            style={{
              background: primaryColor,
              color: isLight ? '#222' : '#fff',
              border: '1px solid #ddd',
            }}
            disabled={!!error}
          >
            <Check className="w-4 h-4 mr-1" />
            TESTE
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2 rounded-2xl shadow-xl py-3 text-lg"
        style={{
          background: primaryColor,
          color: isLight ? '#222' : '#fff',
        }}
        disabled={!!error}
      >
        Salvar Configurações
      </button>
    </div>
  )
}
