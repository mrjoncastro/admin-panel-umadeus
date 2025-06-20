import { describe, it, expect, vi, afterEach } from 'vitest'
import path from 'path'

vi.mock('fs/promises', () => ({ appendFile: vi.fn() }))

import { logConciliacaoErro } from '../lib/server/logger'
import * as fsPromises from 'fs/promises'

describe('logConciliacaoErro', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('escreve mensagem no arquivo de log', async () => {
    const appendFileSpy = vi.spyOn(fsPromises, 'appendFile')
    await logConciliacaoErro('teste')
    const logPath = path.join(process.cwd(), 'logs', 'ERR_LOG.md')
    expect(appendFileSpy).toHaveBeenCalledWith(
      logPath,
      expect.stringContaining('teste'),
    )
  })

  it('exibe erro no console quando falha', async () => {
    const err = new Error('fail')
    const appendFileSpy = vi
      .spyOn(fsPromises, 'appendFile')
      .mockRejectedValue(err)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logConciliacaoErro('teste')
    expect(consoleSpy).toHaveBeenCalledWith('Falha ao registrar ERR_LOG', err)
    expect(appendFileSpy).toHaveBeenCalled()
  })
})
