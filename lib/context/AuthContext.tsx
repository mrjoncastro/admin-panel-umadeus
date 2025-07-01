'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import createPocketBase, { clearBaseAuth, updateBaseAuth } from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import type { UserModel } from '@/types/UserModel'

type AuthContextType = {
  user: UserModel | null
  /** ID do cliente (tenant) */
  tenantId: string | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: (
    nome: string,
    email: string,
    telefone: string,
    cpf: string,
    dataNascimento: string,
    endereco: string,
    numero: string,
    bairro: string,
    estado: string,
    cep: string,
    cidade: string,
    password: string,
  ) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenantId: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pb = useMemo(() => createPocketBase(), [])
  const [user, setUser] = useState<UserModel | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubscribe = () => {}
    async function loadAuth() {
      try {
        const meRes = await fetch('/api/auth/me', {
          headers: getAuthHeaders(pb),
          credentials: 'include',
        })
        if (meRes.ok) {
          const data = await meRes.json()
          setUser(data.user as UserModel)
          setIsLoggedIn(true)
        }
        const tenantRes = await fetch('/api/tenant', {
          headers: getAuthHeaders(pb),
          credentials: 'include',
        })
        if (tenantRes.ok) {
          const { tenantId } = await tenantRes.json()
          setTenantId(tenantId)
        } else {
          setTenantId(null)
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
        }
        clearBaseAuth()
        setUser(null)
        setTenantId(null)
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
      unsubscribe = pb.authStore.onChange(() => {})
    }

    loadAuth()
    return () => {
      unsubscribe()
    }
  }, [pb])

  const login = async (email: string, password: string) => {
    const headers = { ...getAuthHeaders(pb), 'Content-Type': 'application/json' }
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || 'Login failed')
    }
    const data = await res.json()
    pb.authStore.save(data.token, data.user)
    updateBaseAuth(data.token, data.user)
    setUser(data.user as UserModel)
    setIsLoggedIn(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pb_user', JSON.stringify(data.user))
    }
    const tenantRes = await fetch('/api/tenant', {
      headers: getAuthHeaders(pb),
      credentials: 'include',
    })
    if (tenantRes.ok) {
      const { tenantId } = await tenantRes.json()
      setTenantId(tenantId)
    } else {
      setTenantId(null)
    }
  }

  const signUp = async (
    nome: string,
    email: string,
    telefone: string,
    cpf: string,
    dataNascimento: string,
    endereco: string,
    numero: string,
    bairro: string,
    estado: string,
    cep: string,
    cidade: string,
    password: string,
  ) => {
    let clienteId: string | null = null
    try {
      const tenantRes = await fetch('/api/tenant', {
        headers: getAuthHeaders(pb),
        credentials: 'include',
      })
      if (tenantRes.ok) {
        const data = await tenantRes.json()
        clienteId = data.tenantId
        setTenantId(clienteId)
      } else {
        setTenantId(null)
      }
    } catch {
      setTenantId(null)
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { ...getAuthHeaders(pb), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        nome,
        email,
        telefone,
        cpf,
        data_nascimento: dataNascimento,
        endereco,
        numero,
        bairro,
        estado,
        cep,
        cidade,
        password,
        cliente: clienteId,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      const msg = data?.erro || data?.error || 'Falha no cadastro'
      throw new Error(msg)
    }
    await login(email, password)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(pb),
      credentials: 'include',
    })
    pb.authStore.clear()
    clearBaseAuth()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pb_user')
    }
    setUser(null)
    setTenantId(null)
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider
      value={{ user, tenantId, isLoggedIn, isLoading, login, signUp, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
