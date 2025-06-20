import { describe, it, expect, vi, afterEach } from 'vitest'
import path from 'path'

vi.mock('fs/promises', () => ({ appendFile: vi.fn() }))

import { logConciliacaoErro } from '../lib/server/logger'
import { appendFile } from 'fs/promises'

describe('logConciliacaoErro', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('escreve mensagem no arquivo de log', async () => {
    await logConciliacaoErro('teste')
    const logPath = path.join(process.cwd(), 'logs', 'ERR_LOG.md')
    expect(appendFile).toHaveBeenCalledWith(
      logPath,
      expect.stringContaining('teste'),
    )
  })

  it('exibe erro no console quando falha', async () => {
    const err = new Error('fail')
    ;(
      appendFile as unknown as { mockRejectedValue: (v: any) => void }
    ).mockRejectedValue(err)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logConciliacaoErro('teste')
    expect(consoleSpy).toHaveBeenCalledWith('Falha ao registrar ERR_LOG', err)
  })
})
