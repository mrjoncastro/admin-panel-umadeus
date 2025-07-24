import { appendFile } from 'fs/promises'
import path from 'path'
import LogRocket from 'logrocket'

let lrInitialized = false

function ensureLogRocket() {
  if (!lrInitialized) {
    try {
      LogRocket.init('4pjmeb/m24')
      lrInitialized = true
    } catch (err) {
      logger.error('Falha ao iniciar LogRocket', err)
    }
  }
  return lrInitialized
}

export async function logConciliacaoErro(message: string) {
  const date = new Date().toISOString().split('T')[0]
  const env = process.env.NODE_ENV || 'dev'
  const line = `## [${date}] ${message} - ${env}\n`
  try {
    const isServerless = Boolean(
      process.env.VERCEL || process.env.AWS_EXECUTION_ENV,
    )
    const logPath = isServerless
      ? path.join('/tmp', 'ERR_LOG.md')
      : path.join(process.cwd(), 'logs', 'ERR_LOG.md')

    await appendFile(logPath, line)

    // em ambientes serverless, opcionalmente envie a linha para um servico externo
    // await sendLogToExternalService(line)
  } catch (err) {
    logger.error('Falha ao registrar ERR_LOG', err)
  }
}

export function logRocketEvent(
  message: string,
  data?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV !== 'production') return
  if (!ensureLogRocket()) return
  try {
    if (data) {
      LogRocket.track(
        message,
        data as Record<
          string,
          | string
          | number
          | boolean
          | string[]
          | number[]
          | boolean[]
          | null
          | undefined
        >,
      )
    } else {
      LogRocket.captureMessage(message)
    }
  } catch (err) {
    logger.error('Falha ao enviar log ao LogRocket', err)
  }
}
import { logger } from '@/lib/logger'
