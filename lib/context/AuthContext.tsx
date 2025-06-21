'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import createPocketBase, {
  clearBaseAuth,
  updateBaseAuth,
} from '@/lib/pocketbase'
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
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenantId: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => {},
  signUp: async () => {},
  logout: () => {},
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
        const meRes = await fetch('/api/auth/me', { credentials: 'include' })
        if (meRes.ok) {
          const data = await meRes.json()
          pb.authStore.loadFromCookie(document.cookie)
          updateBaseAuth(pb.authStore.token, pb.authStore.model)
          setUser(data.user as UserModel)
          setIsLoggedIn(true)
        }
        const tenantRes = await fetch('/api/tenant')
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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    pb.authStore.loadFromCookie(document.cookie)
    updateBaseAuth(pb.authStore.token, pb.authStore.model)
    setUser(data.user as UserModel)
    setIsLoggedIn(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pb_user', JSON.stringify(data.user))
    }
    const tenantRes = await fetch('/api/tenant')
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
      const tenantRes = await fetch('/api/tenant')
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

    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    await login(email, password)
  }

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' })
    pb.authStore.clear()
    clearBaseAuth()
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
