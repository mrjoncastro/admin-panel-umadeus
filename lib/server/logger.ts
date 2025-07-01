import { appendFile } from 'fs/promises'
import path from 'path'

export async function logConciliacaoErro(message: string) {
  const date = new Date().toISOString().split('T')[0]
  const env = process.env.NODE_ENV || 'dev'
  const line = `## [${date}] ${message} - ${env}\n`
  try {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_EXECUTION_ENV)
    const logPath = isServerless
      ? path.join('/tmp', 'ERR_LOG.md')
      : path.join(process.cwd(), 'logs', 'ERR_LOG.md')

    await appendFile(logPath, line)

    // em ambientes serverless, opcionalmente envie a linha para um servico externo
    // await sendLogToExternalService(line)
  } catch (err) {
    console.error('Falha ao registrar ERR_LOG', err)
  }
}
