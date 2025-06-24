
async function appendToLog(line: string) {
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.error(line.trim())
    return
  }

  const { appendFile } = await import('fs/promises')
  const path = await import('path')
  const logPath = path.join(process.cwd(), 'logs', 'ERR_LOG.md')
  await appendFile(logPath, line)
}

export async function logConciliacaoErro(message: string) {
  const date = new Date().toISOString().split('T')[0]
  const env = process.env.NODE_ENV || 'dev'
  const line = `## [${date}] ${message} - ${env}\n`
  try {
    await appendToLog(line)
  } catch (err) {
    console.error('Falha ao registrar ERR_LOG', err)
  }
}
