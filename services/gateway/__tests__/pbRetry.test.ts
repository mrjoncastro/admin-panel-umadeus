import { describe, it, expect, vi } from 'vitest'
import { pbRetry } from '../lib/pbRetry'

describe('pbRetry', () => {
  it('tenta novamente em erro de rede', async () => {
    const err = Object.assign(new Error('fetch failed'), { status: 0 })
    const fn = vi
      .fn<[], Promise<string>>()
      .mockRejectedValueOnce(err)
      .mockResolvedValue('ok')

    const result = await pbRetry(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('nao repete em erro diferente', async () => {
    const err = new Error('fatal')
    const fn = vi.fn<[], Promise<string>>().mockRejectedValue(err)
    await expect(pbRetry(fn)).rejects.toThrow(err)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
