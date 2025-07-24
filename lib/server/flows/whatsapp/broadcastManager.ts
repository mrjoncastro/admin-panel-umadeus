import {
  BroadcastQueue,
  BroadcastConfig,
  DEFAULT_CONFIG,
} from './broadcastQueue'

class BroadcastManager {
  private queues = new Map<string, BroadcastQueue>()

  private getQueue(tenant: string) {
    let q = this.queues.get(tenant)
    if (!q) {
      q = new BroadcastQueue({ ...DEFAULT_CONFIG })
      this.queues.set(tenant, q)
    }
    return q
  }

  enqueue<T>(tenant: string, task: () => Promise<T>): Promise<T> {
    return this.getQueue(tenant).add(task)
  }

  updateTenantConfig(tenant: string, config: Partial<BroadcastConfig>) {
    const q = this.getQueue(tenant)
    Object.assign(q.config, config)
  }

  getAllStats() {
    const stats: Record<
      string,
      { pending: number; total: number; sent: number; failed: number }
    > = {}
    for (const [tenant, q] of this.queues.entries()) {
      stats[tenant] = {
        pending: q.pending,
        total: q.total,
        sent: q.sent,
        failed: q.failed,
      }
    }
    return stats
  }

  getStats(tenant: string) {
    const q = this.queues.get(tenant)
    if (!q) return { total: 0, sent: 0, failed: 0, pending: 0 }
    return {
      total: q.total,
      sent: q.sent,
      failed: q.failed,
      pending: q.pending,
    }
  }

  cancel(tenant: string) {
    const q = this.queues.get(tenant)
    if (q) q.cancel()
  }
}

export const broadcastManager = new BroadcastManager()
