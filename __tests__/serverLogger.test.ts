import { describe, it, expect, vi, afterEach } from 'vitest'
import { logConciliacaoErro, logError } from '../lib/server/logger'

describe('logConciliacaoErro', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('envia mensagem para o console', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logConciliacaoErro('teste')
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'teste' }),
    )
  })
})

describe('logError', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registra erro detalhado', async () => {
    const err = new Error('fail')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logError(err)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'fail' }),
    )
  })
})
