import { appendFile } from 'fs/promises'
import path from 'path'
import * as Sentry from '@sentry/nextjs'

const { logger } = Sentry

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
    logger.error(message)
    Sentry.captureException(new Error(message))
  } catch (err) {
    console.error('Falha ao registrar ERR_LOG', err)
    Sentry.captureException(err)
  }
}

export function logSentryEvent(
  message: string,
  data?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV !== 'production') return
  try {
    if (data) {
      Sentry.withScope(scope => {
        Object.entries(data).forEach(([k, v]) => scope.setExtra(k, v))
        Sentry.captureMessage(message)
      })
    } else {
      Sentry.captureMessage(message)
    }
  } catch (err) {
    console.error('Falha ao enviar log ao Sentry', err)
    Sentry.captureException(err)
  }
}
