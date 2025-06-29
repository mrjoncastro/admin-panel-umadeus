import { BroadcastQueue, type BroadcastConfig, type BroadcastMessage } from './broadcastQueue'
import createPocketBase from '@/lib/pocketbase'

interface TenantBroadcastConfig {
  // Configurações de envio
  delayBetweenMessages: number
  delayBetweenBatches: number
  batchSize: number
  maxMessagesPerMinute: number
  maxMessagesPerHour: number
  
  // Configurações de retry
  maxRetries: number
  retryDelay: number
  
  // Configurações de horário
  allowedHours: {
    start: number // 0-23
    end: number // 0-23
  }
  timezone: string
}

class BroadcastManager {
  private queues = new Map<string, BroadcastQueue>()
  private configs = new Map<string, TenantBroadcastConfig>()

  /**
   * Obtém ou cria uma fila para um tenant
   */
  private getQueue(tenantId: string): BroadcastQueue {
    if (!this.queues.has(tenantId)) {
      const config = this.getTenantConfig(tenantId)
      const queue = new BroadcastQueue({
        delayBetweenMessages: config.delayBetweenMessages,
        delayBetweenBatches: config.delayBetweenBatches,
        batchSize: config.batchSize,
        maxMessagesPerMinute: config.maxMessagesPerMinute,
        maxMessagesPerHour: config.maxMessagesPerHour,
        maxRetries: config.maxRetries,
        retryDelay: config.retryDelay
      })
      this.queues.set(tenantId, queue)
    }
    return this.queues.get(tenantId)!
  }

  /**
   * Obtém configuração do tenant (com fallback para padrões)
   */
  private getTenantConfig(tenantId: string): TenantBroadcastConfig {
    if (!this.configs.has(tenantId)) {
      // Configuração padrão (mais conservadora)
      this.configs.set(tenantId, {
        // Delays mais naturais (como humano digitando)
        delayBetweenMessages: 3000, // 3 segundos
        delayBetweenBatches: 15000, // 15 segundos
        batchSize: 3, // 3 mensagens por lote
        
        // Limites conservadores (evitar bloqueios)
        maxMessagesPerMinute: 20,
        maxMessagesPerHour: 80,
        
        // Retry
        maxRetries: 2,
        retryDelay: 10000,
        
        // Horário permitido (9h às 21h)
        allowedHours: { start: 9, end: 21 },
        timezone: 'America/Sao_Paulo'
      })
    }
    return this.configs.get(tenantId)!
  }

  /**
   * Verifica se está dentro do horário permitido
   */
  private isWithinAllowedHours(tenantId: string): boolean {
    const config = this.getTenantConfig(tenantId)
    const now = new Date()
    
    // Converte para timezone do tenant (simplificado)
    const hour = now.getHours()
    
    return hour >= config.allowedHours.start && hour < config.allowedHours.end
  }

  /**
   * Adiciona mensagens à fila do tenant
   */
  async addMessages(
    tenantId: string,
    messages: Omit<BroadcastMessage, 'id' | 'retries' | 'status'>[]
  ): Promise<{ success: boolean; message: string; queueId?: string }> {
    try {
      // Verifica horário permitido
      if (!this.isWithinAllowedHours(tenantId)) {
        const config = this.getTenantConfig(tenantId)
        return {
          success: false,
          message: `Envio permitido apenas entre ${config.allowedHours.start}h e ${config.allowedHours.end}h`
        }
      }

      const queue = this.getQueue(tenantId)
      
      // Verifica se a fila já está processando
      if (queue.getStats().isProcessing) {
        return {
          success: false,
          message: 'Já existe um broadcast em andamento para este tenant'
        }
      }

      queue.addMessages(messages)
      
      // Inicia processamento em background
      this.startProcessing(tenantId)

      return {
        success: true,
        message: `${messages.length} mensagens adicionadas à fila`,
        queueId: tenantId
      }

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Inicia processamento da fila em background
   */
  private async startProcessing(tenantId: string): Promise<void> {
    const queue = this.getQueue(tenantId)
    
    try {
      await queue.startProcessing()
    } catch (error) {
      console.error(`Erro no processamento da fila do tenant ${tenantId}:`, error)
    }
  }

  /**
   * Obtém progresso da fila do tenant
   */
  getProgress(tenantId: string) {
    const queue = this.queues.get(tenantId)
    if (!queue) {
      return null
    }
    return queue.getStats()
  }

  /**
   * Para o processamento da fila do tenant
   */
  stopQueue(tenantId: string): boolean {
    const queue = this.queues.get(tenantId)
    if (queue) {
      queue.stop()
      return true
    }
    return false
  }

  /**
   * Limpa a fila do tenant
   */
  clearQueue(tenantId: string): boolean {
    const queue = this.queues.get(tenantId)
    if (queue) {
      queue.clear()
      return true
    }
    return false
  }

  /**
   * Atualiza configuração do tenant
   */
  updateTenantConfig(tenantId: string, config: Partial<TenantBroadcastConfig>): void {
    const currentConfig = this.getTenantConfig(tenantId)
    this.configs.set(tenantId, { ...currentConfig, ...config })
    
    // Recria a fila com nova configuração
    this.queues.delete(tenantId)
  }

  /**
   * Obtém estatísticas de todos os tenants
   */
  getAllStats() {
    const stats: Record<string, any> = {}
    
    for (const [tenantId, queue] of this.queues) {
      stats[tenantId] = {
        ...queue.getStats(),
        config: this.getTenantConfig(tenantId)
      }
    }
    
    return stats
  }

  /**
   * Carrega configurações do banco de dados
   */
  async loadTenantConfigs(): Promise<void> {
    try {
      const pb = createPocketBase()
      
      if (!pb.authStore.isValid) {
        await pb.admins.authWithPassword(
          process.env.PB_ADMIN_EMAIL!,
          process.env.PB_ADMIN_PASSWORD!
        )
      }

      // Busca configurações de broadcast dos tenants
      const configs = await pb.collection('whatsapp_broadcast_config').getFullList()
      
      for (const config of configs) {
        if (config.cliente) {
          this.configs.set(config.cliente, {
            delayBetweenMessages: config.delayBetweenMessages || 3000,
            delayBetweenBatches: config.delayBetweenBatches || 15000,
            batchSize: config.batchSize || 3,
            maxMessagesPerMinute: config.maxMessagesPerMinute || 20,
            maxMessagesPerHour: config.maxMessagesPerHour || 80,
            maxRetries: config.maxRetries || 2,
            retryDelay: config.retryDelay || 10000,
            allowedHours: {
              start: config.allowedHoursStart || 9,
              end: config.allowedHoursEnd || 21
            },
            timezone: config.timezone || 'America/Sao_Paulo'
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de broadcast:', error)
    }
  }
}

// Instância singleton
export const broadcastManager = new BroadcastManager()

// Carrega configurações na inicialização
broadcastManager.loadTenantConfigs()

export type { TenantBroadcastConfig } 