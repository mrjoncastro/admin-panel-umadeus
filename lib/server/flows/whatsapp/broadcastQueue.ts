export interface BroadcastConfig {
  delayBetweenMessages: number
  delayBetweenBatches: number
  batchSize: number
  maxMessagesPerMinute: number
  maxMessagesPerHour: number
  maxRetries: number
  retryDelay: number
  allowedHours: { start: number; end: number }
  timezone: string
}

export const DEFAULT_CONFIG: BroadcastConfig = {
  delayBetweenMessages: 3000,
  delayBetweenBatches: 15000,
  batchSize: 3,
  maxMessagesPerMinute: 20,
  maxMessagesPerHour: 80,
  maxRetries: 2,
  retryDelay: 10000,
  allowedHours: { start: 9, end: 21 },
  timezone: 'America/Sao_Paulo',
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface QueueItem<T> {
  task: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

export class BroadcastQueue {
  private queue: QueueItem<unknown>[] = []
  private processing = false
  private timestamps: number[] = []
  private counters = { total: 0, sent: 0, failed: 0 }
  constructor(public config: BroadcastConfig = { ...DEFAULT_CONFIG }) {}

  get pending() {
    return this.queue.length
  }

  get total() {
    return this.counters.total
  }

  get sent() {
    return this.counters.sent
  }

  get failed() {
    return this.counters.failed
  }

  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        task: task as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      })
      this.counters.total++
      this.process().catch((err) =>
        console.error('Erro no processamento da fila:', err),
      )
    })
  }

  private async process() {
    if (this.processing) return
    this.processing = true
    while (this.queue.length) {
      await this.waitForAllowedTime()
      await this.ensureRateLimit()
      const batch = this.queue.splice(0, this.config.batchSize)
      for (const item of batch) {
        try {
          const res = await this.executeWithRetry(
            item.task,
            this.config.maxRetries,
          )
          item.resolve(res)
          this.counters.sent++
        } catch (err) {
          item.reject(err)
          console.error('Erro no processamento da fila:', err)
          this.counters.failed++
        }
        this.timestamps.push(Date.now())
        await sleep(this.config.delayBetweenMessages)
      }
      if (this.queue.length) {
        await sleep(this.config.delayBetweenBatches)
      }
    }
    this.processing = false
  }

  private async executeWithRetry<T>(
    task: () => Promise<T>,
    retries: number,
  ): Promise<T> {
    try {
      return await task()
    } catch (err) {
      if (retries > 0) {
        await sleep(this.config.retryDelay)
        return this.executeWithRetry(task, retries - 1)
      }
      throw err
    }
  }

  private async waitForAllowedTime() {
    const { allowedHours, timezone } = this.config
    const now = new Date()
    const tzNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    const hour = tzNow.getHours()
    if (hour >= allowedHours.start && hour < allowedHours.end) return
    const start = new Date(tzNow)
    if (hour >= allowedHours.end) start.setDate(start.getDate() + 1)
    start.setHours(allowedHours.start, 0, 0, 0)
    const diff = start.getTime() - tzNow.getTime()
    if (diff > 0) await sleep(diff)
  }

  private async ensureRateLimit() {
    const now = Date.now()
    this.timestamps = this.timestamps.filter((t) => now - t < 3600_000)
    const lastMinute = this.timestamps.filter((t) => now - t < 60_000)
    if (lastMinute.length >= this.config.maxMessagesPerMinute) {
      const wait = 60_000 - (now - lastMinute[0])
      await sleep(wait)
    }
    if (this.timestamps.length >= this.config.maxMessagesPerHour) {
      const wait = 3600_000 - (now - this.timestamps[0])
      await sleep(wait)
    }
  }

  cancel() {
    this.queue = []
    this.processing = false
  }
}
