import { NextRequest } from 'next/server'

// Configurações de rate limiting por endpoint
export const RATE_LIMITS = {
  // APIs gerais
  'api_geral': { requests: 100, window: 60 }, // 100 req/min
  'api_busca': { requests: 200, window: 60 }, // 200 req/min para buscas
  'api_produtos': { requests: 150, window: 60 }, // 150 req/min para produtos
  
  // APIs críticas (menor limite)
  'api_checkout': { requests: 10, window: 60 }, // 10 req/min para checkout
  'api_pagamento': { requests: 5, window: 60 }, // 5 req/min para pagamentos
  'api_upload': { requests: 20, window: 3600 }, // 20 uploads/hora
  
  // Marketplace específico
  'vendor_dashboard': { requests: 300, window: 60 }, // 300 req/min para vendors
  'admin_marketplace': { requests: 500, window: 60 }, // 500 req/min para admins
  'marketplace_public': { requests: 1000, window: 60 }, // 1000 req/min para páginas públicas
} as const

type RateLimitKey = keyof typeof RATE_LIMITS

// Store em memória para rate limiting (em produção, usar Redis)
class InMemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = this.store.get(key)
    if (!data) return null
    
    // Limpar se expirou
    if (Date.now() > data.resetTime) {
      this.store.delete(key)
      return null
    }
    
    return data
  }

  async set(key: string, count: number, resetTime: number): Promise<void> {
    this.store.set(key, { count, resetTime })
  }

  async increment(key: string): Promise<number> {
    const data = this.store.get(key)
    if (!data) return 1
    
    data.count += 1
    return data.count
  }

  // Limpar entradas expiradas periodicamente
  cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

const store = new InMemoryStore()

// Cleanup a cada 5 minutos
setInterval(() => store.cleanup(), 5 * 60 * 1000)

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

export function getClientId(request: NextRequest): string {
  // Usar IP + User-Agent como identificador
  const ip = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Hash simples para anonimizar
  return Buffer.from(`${ip}-${userAgent}`).toString('base64').slice(0, 16)
}

export async function checkRateLimit(
  identifier: string,
  limitKey: RateLimitKey
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[limitKey]
  const windowMs = config.window * 1000
  const now = Date.now()
  const resetTime = now + windowMs
  
  const key = `${limitKey}:${identifier}`
  
  try {
    const existing = await store.get(key)
    
    if (!existing) {
      // Primeira requisição na janela
      await store.set(key, 1, resetTime)
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
        resetTime
      }
    }
    
    if (existing.count >= config.requests) {
      // Limite excedido
      return {
        success: false,
        limit: config.requests,
        remaining: 0,
        resetTime: existing.resetTime,
        retryAfter: Math.ceil((existing.resetTime - now) / 1000)
      }
    }
    
    // Incrementar contador
    const newCount = await store.increment(key)
    
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - newCount,
      resetTime: existing.resetTime
    }
    
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Em caso de erro, permitir a requisição
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      resetTime
    }
  }
}

// Middleware helper para aplicar rate limiting
export function createRateLimitMiddleware(limitKey: RateLimitKey) {
  return async (request: NextRequest) => {
    const clientId = getClientId(request)
    const result = await checkRateLimit(clientId, limitKey)
    
    const headers = new Headers()
    headers.set('X-RateLimit-Limit', result.limit.toString())
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
    
    if (!result.success) {
      headers.set('Retry-After', result.retryAfter!.toString())
      
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers.entries())
          }
        }
      )
    }
    
    return { headers }
  }
}

// Rate limiting específico por usuário autenticado
export async function checkUserRateLimit(
  userId: string,
  action: string,
  limit: number,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `user:${userId}:${action}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const resetTime = now + windowMs
  
  try {
    const existing = await store.get(key)
    
    if (!existing) {
      await store.set(key, 1, resetTime)
      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetTime
      }
    }
    
    if (existing.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        resetTime: existing.resetTime,
        retryAfter: Math.ceil((existing.resetTime - now) / 1000)
      }
    }
    
    const newCount = await store.increment(key)
    
    return {
      success: true,
      limit,
      remaining: limit - newCount,
      resetTime: existing.resetTime
    }
    
  } catch (error) {
    console.error('User rate limit check failed:', error)
    return {
      success: true,
      limit,
      remaining: limit,
      resetTime
    }
  }
}

// Rate limiting adaptativo baseado na carga do sistema
export class AdaptiveRateLimit {
  private baseMultiplier = 1.0
  private currentLoad = 0
  
  updateSystemLoad(load: number) {
    this.currentLoad = Math.max(0, Math.min(1, load)) // 0-1
    
    // Reduzir limites quando a carga está alta
    if (load > 0.8) {
      this.baseMultiplier = 0.5 // 50% dos limites normais
    } else if (load > 0.6) {
      this.baseMultiplier = 0.7 // 70% dos limites normais
    } else {
      this.baseMultiplier = 1.0 // Limites normais
    }
  }
  
  getAdjustedLimit(baseLimit: number): number {
    return Math.floor(baseLimit * this.baseMultiplier)
  }
  
  async checkAdaptiveRateLimit(
    identifier: string,
    limitKey: RateLimitKey
  ): Promise<RateLimitResult> {
    const baseConfig = RATE_LIMITS[limitKey]
    const adjustedLimit = this.getAdjustedLimit(baseConfig.requests)
    
    // Criar configuração temporária com limite ajustado
    const tempConfig = { ...baseConfig, requests: adjustedLimit }
    
    // Usar a mesma lógica do rate limiting normal
    const windowMs = tempConfig.window * 1000
    const now = Date.now()
    const resetTime = now + windowMs
    const key = `adaptive:${limitKey}:${identifier}`
    
    try {
      const existing = await store.get(key)
      
      if (!existing) {
        await store.set(key, 1, resetTime)
        return {
          success: true,
          limit: adjustedLimit,
          remaining: adjustedLimit - 1,
          resetTime
        }
      }
      
      if (existing.count >= adjustedLimit) {
        return {
          success: false,
          limit: adjustedLimit,
          remaining: 0,
          resetTime: existing.resetTime,
          retryAfter: Math.ceil((existing.resetTime - now) / 1000)
        }
      }
      
      const newCount = await store.increment(key)
      
      return {
        success: true,
        limit: adjustedLimit,
        remaining: adjustedLimit - newCount,
        resetTime: existing.resetTime
      }
      
    } catch (error) {
      console.error('Adaptive rate limit check failed:', error)
      return {
        success: true,
        limit: adjustedLimit,
        remaining: adjustedLimit,
        resetTime
      }
    }
  }
}

export const adaptiveRateLimit = new AdaptiveRateLimit()

// Utilitário para monitorar performance e ajustar rate limits
export function monitorPerformance() {
  const startTime = process.hrtime.bigint()
  
  return {
    end: () => {
      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1000000 // Convert to ms
      
      // Calcular carga baseada no tempo de resposta
      // Mais de 500ms = alta carga, menos de 100ms = baixa carga
      const load = Math.min(1, Math.max(0, (duration - 100) / 400))
      
      adaptiveRateLimit.updateSystemLoad(load)
      
      return { duration, load }
    }
  }
}