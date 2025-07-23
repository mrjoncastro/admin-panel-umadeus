import { logger } from '@/lib/logger'
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

interface LogContext {
  userId?: string
  tenantId?: string
  action?: string
  [key: string]: any
}

// Lista de campos sensíveis que nunca devem ser logados
const SENSITIVE_FIELDS = [
  'password',
  'passwordConfirm',
  'token',
  'api_key',
  'apikey',
  'secret',
  'auth',
  'credential',
  'private',
  'key'
]

// Função para sanitizar objetos removendo campos sensíveis
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }

  const sanitized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase()
    if (SENSITIVE_FIELDS.some(field => keyLower.includes(field))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      logger.debug(`[INFO] ${message}`, context ? sanitizeObject(context) : '')
    }
    // Em produção, enviar para serviço de logging externo se necessário
  },

  error: (message: string, error?: Error | any, context?: LogContext) => {
    if (isDevelopment) {
      logger.error(`[ERROR] ${message}`, {
        error: error?.message || error,
        context: context ? sanitizeObject(context) : undefined
      })
    } else {
      // Em produção, log apenas dados não sensíveis
      logger.error(`[ERROR] ${message}`, {
        timestamp: new Date().toISOString(),
        context: context ? sanitizeObject(context) : undefined
      })
    }
  },

  warn: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      logger.warn(`[WARN] ${message}`, context ? sanitizeObject(context) : '')
    }
  },

  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context ? sanitizeObject(context) : '')
    }
    // Debug logs nunca em produção
  },

  // Log específico para operações sensíveis (nunca loga dados sensíveis)
  security: (action: string, context?: Omit<LogContext, 'action'>) => {
    const secureContext = {
      action,
      timestamp: new Date().toISOString(),
      ...sanitizeObject(context || {})
    }
    
    if (isDevelopment) {
      logger.debug(`[SECURITY] ${action}`, secureContext)
    } else {
      logger.debug(`[SECURITY] ${action}`, {
        timestamp: secureContext.timestamp,
        userId: secureContext.userId,
        tenantId: secureContext.tenantId
      })
    }
  }
}

// Função helper para logs condicionais
export function conditionalLog(condition: boolean, level: 'info' | 'error' | 'warn' | 'debug', message: string, context?: LogContext) {
  if (condition) {
    logger[level](message, context)
  }
}

// Para compatibilidade com console.log existente
export function safeConsoleLog(message: string, data?: any) {
  if (isDevelopment) {
    logger.debug(message, data ? sanitizeObject(data) : '')
  }
}
