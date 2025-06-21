'use client'
import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { generatePrimaryShades } from '@/utils/primaryShades'

const STALE_TIME = 1000 * 60 * 60 // 1 hour

export type TenantConfig = {
  font: string
  primaryColor: string
  logoUrl: string
  confirmaInscricoes: boolean
}

export const defaultConfig: TenantConfig = {
  font: 'var(--font-geist)',
  primaryColor: '#7c3aed',
  logoUrl: '/img/logo_umadeus_branco.png',
  confirmaInscricoes: false,
}

type TenantContextType = {
  config: TenantConfig
  updateConfig: (cfg: Partial<TenantConfig>) => void
}

const TenantContext = createContext<TenantContextType>({
  config: defaultConfig,
  updateConfig: () => {},
})

export function TenantProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode
  initialConfig?: TenantConfig
}) {
  const [config, setConfig] = useState<TenantConfig>(
    initialConfig ?? defaultConfig,
  )
  const [configId, setConfigId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (initialConfig) {
      localStorage.setItem('app_config', JSON.stringify(initialConfig))
      localStorage.setItem('app_config_time', Date.now().toString())
    }

    async function fetchInitialConfig() {
      try {
        const res = await fetch('/api/tenant-config', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          const cfg: TenantConfig = {
            font: data.font || defaultConfig.font,
            primaryColor: data.cor_primary || defaultConfig.primaryColor,
            logoUrl: data.logo_url || defaultConfig.logoUrl,
            confirmaInscricoes:
              data.confirmaInscricoes ??
              data.confirma_inscricoes ??
              defaultConfig.confirmaInscricoes,
          }
          setConfigId(data.id)
          setConfig(cfg)
          localStorage.setItem('app_config', JSON.stringify(cfg))
          localStorage.setItem('app_config_time', Date.now().toString())
          return
        }
      } catch {
        /* ignore */
      }

      const cached = localStorage.getItem('app_config')
      if (cached) {
        try {
          setConfig(JSON.parse(cached))
        } catch {
          /* ignore */
        }
      }
    }

    async function refreshConfig() {
      const storedTime = localStorage.getItem('app_config_time')
      const isStale =
        !storedTime || Date.now() - Number(storedTime) > STALE_TIME
      const cached = localStorage.getItem('app_config')

      if (!cached || isStale) {
        try {
          const res = await fetch('/api/tenant-config', {
            credentials: 'include',
          })
          if (res.ok) {
            const data = await res.json()
            const cfg = {
              font: data.font || defaultConfig.font,
              primaryColor: data.cor_primary || defaultConfig.primaryColor,
              logoUrl: data.logo_url || defaultConfig.logoUrl,
              confirmaInscricoes:
                data.confirmaInscricoes ??
                data.confirma_inscricoes ??
                defaultConfig.confirmaInscricoes,
            }
            setConfigId(data.id)
            setConfig(cfg)
            localStorage.setItem('app_config', JSON.stringify(cfg))
            localStorage.setItem('app_config_time', Date.now().toString())
          }
        } catch {
          /* ignore */
        }
      }
    }

    if (!initialConfig) {
      fetchInitialConfig()
    }
    refreshConfig()
  }, [initialConfig])

  useEffect(() => {
    if (typeof window === 'undefined') return

    localStorage.setItem('app_config', JSON.stringify(config))
    localStorage.setItem('app_config_time', Date.now().toString())
    document.documentElement.style.setProperty('--font-body', config.font)
    document.documentElement.style.setProperty('--font-heading', config.font)
    document.documentElement.style.setProperty('--logo-url', config.logoUrl)
    document.documentElement.style.setProperty('--accent', config.primaryColor)
    const shades = generatePrimaryShades(config.primaryColor)
    document.documentElement.style.setProperty('--accent-900', shades['900'])
    Object.entries(shades).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--primary-${key}`, value)
    })
  }, [config])

  const updateConfig = (cfg: Partial<TenantConfig>) => {
    const newCfg = { ...config, ...cfg }
    setConfig(newCfg)

    if (typeof window !== 'undefined' && configId) {
      fetch('/api/tenant-config', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: configId,
          cor_primary: newCfg.primaryColor,
          logo_url: newCfg.logoUrl,
          font: newCfg.font,
          confirma_inscricoes: newCfg.confirmaInscricoes,
        }),
      }).catch((err) => console.error('Erro ao salvar config:', err))
    }
  }

  return (
    <TenantContext.Provider value={{ config, updateConfig }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}
