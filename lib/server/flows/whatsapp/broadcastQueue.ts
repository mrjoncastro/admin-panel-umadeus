import { sendTextMessage } from '@/lib/server/chats'

interface BroadcastConfig {
  // Delays entre mensagens (em ms)
  delayBetweenMessages: number
  delayBetweenBatches: number
  batchSize: number
  
  // Limites de taxa
  maxMessagesPerMinute: number
  maxMessagesPerHour: number
  
  // Configurações de retry
  maxRetries: number
  retryDelay: number
}

interface BroadcastMessage {
  id: string
  to: string
  message: string
  instanceName: string
  apiKey: string
  retries: number
  status: 'pending' | 'sending' | 'sent' | 'failed'
  error?: string
  sentAt?: Date
}

interface BroadcastProgress {
  total: number
  sent: number
  failed: number
  pending: number
  currentBatch: number
  totalBatches: number
  estimatedTimeRemaining: number // em segundos
}

class BroadcastQueue {
  private queue: BroadcastMessage[] = []
  private isProcessing = false
  private config: BroadcastConfig
  private progress: BroadcastProgress
  private messageCounts = {
    lastMinute: 0,
    lastHour: 0,
    lastMinuteTime: Date.now(),
    lastHourTime: Date.now()
  }

  constructor(config: Partial<BroadcastConfig> = {}) {
    this.config = {
      // Delays padrão (mais naturais)
      delayBetweenMessages: 2000, // 2 segundos entre mensagens
      delayBetweenBatches: 10000, // 10 segundos entre lotes
      batchSize: 5, // 5 mensagens por lote
      
      // Limites de taxa (evitar bloqueios)
      maxMessagesPerMinute: 30,
      maxMessagesPerHour: 100,
      
      // Retry
      maxRetries: 3,
      retryDelay: 5000,
      
      ...config
    }

    this.progress = {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      currentBatch: 0,
      totalBatches: 0,
      estimatedTimeRemaining: 0
    }
  }

  /**
   * Adiciona mensagens à fila
   */
  addMessages(messages: Omit<BroadcastMessage, 'id' | 'retries' | 'status'>[]): void {
    const newMessages = messages.map(msg => ({
      ...msg,
      id: `${Date.now()}-${Math.random()}`,
      retries: 0,
      status: 'pending' as const
    }))

    this.queue.push(...newMessages)
    this.progress.total = this.queue.length
    this.progress.pending = this.queue.length
    this.progress.totalBatches = Math.ceil(this.queue.length / this.config.batchSize)
  }

  /**
   * Inicia o processamento da fila
   */
  async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Fila já está sendo processada')
    }

    this.isProcessing = true
    this.progress.currentBatch = 0

    try {
      while (this.queue.length > 0) {
        await this.processBatch()
        
        if (this.queue.length > 0) {
          // Delay entre lotes
          await this.delay(this.config.delayBetweenBatches)
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Processa um lote de mensagens
   */
  private async processBatch(): Promise<void> {
    const batch = this.queue.splice(0, this.config.batchSize)
    this.progress.currentBatch++

    // Verifica limites de taxa
    await this.checkRateLimits()

    // Processa mensagens do lote em paralelo
    const promises = batch.map(msg => this.sendMessage(msg))
    await Promise.allSettled(promises)

    // Atualiza progresso
    this.updateProgress()
  }

  /**
   * Envia uma mensagem individual
   */
  private async sendMessage(message: BroadcastMessage): Promise<void> {
    message.status = 'sending'

    try {
      // Verifica se ainda está dentro dos limites de taxa
      if (!this.canSendMessage()) {
        // Recoloca na fila para tentar depois
        message.status = 'pending'
        this.queue.unshift(message)
        return
      }

      await sendTextMessage({
        instanceName: message.instanceName,
        apiKey: message.apiKey,
        to: message.to,
        message: message.message
      })

      message.status = 'sent'
      message.sentAt = new Date()
      this.progress.sent++
      this.progress.pending--

      // Atualiza contadores de taxa
      this.updateRateCounters()

      // Delay entre mensagens (mais natural)
      await this.delay(this.config.delayBetweenMessages)

    } catch (error) {
      message.error = error instanceof Error ? error.message : 'Erro desconhecido'
      
      if (message.retries < this.config.maxRetries) {
        // Retry
        message.retries++
        message.status = 'pending'
        this.queue.push(message)
        await this.delay(this.config.retryDelay)
      } else {
        // Falha definitiva
        message.status = 'failed'
        this.progress.failed++
        this.progress.pending--
      }
    }
  }

  /**
   * Verifica se pode enviar mensagem baseado nos limites de taxa
   */
  private canSendMessage(): boolean {
    const now = Date.now()
    
    // Limpa contadores antigos
    if (now - this.messageCounts.lastMinuteTime > 60000) {
      this.messageCounts.lastMinute = 0
      this.messageCounts.lastMinuteTime = now
    }
    
    if (now - this.messageCounts.lastHourTime > 3600000) {
      this.messageCounts.lastHour = 0
      this.messageCounts.lastHourTime = now
    }

    return this.messageCounts.lastMinute < this.config.maxMessagesPerMinute &&
           this.messageCounts.lastHour < this.config.maxMessagesPerHour
  }

  /**
   * Atualiza contadores de taxa
   */
  private updateRateCounters(): void {
    this.messageCounts.lastMinute++
    this.messageCounts.lastHour++
  }

  /**
   * Verifica limites de taxa e aguarda se necessário
   */
  private async checkRateLimits(): Promise<void> {
    while (!this.canSendMessage()) {
      // Aguarda até poder enviar
      await this.delay(1000)
    }
  }

  /**
   * Atualiza progresso e tempo estimado
   */
  private updateProgress(): void {
    const completed = this.progress.sent + this.progress.failed
    const remaining = this.progress.total - completed
    
    if (completed > 0) {
      const avgTimePerMessage = (this.config.delayBetweenMessages + this.config.delayBetweenBatches / this.config.batchSize) / 1000
      this.progress.estimatedTimeRemaining = Math.round(remaining * avgTimePerMessage)
    }
  }

  /**
   * Retorna o progresso atual
   */
  getProgress(): BroadcastProgress {
    return { ...this.progress }
  }

  /**
   * Retorna estatísticas detalhadas
   */
  getStats() {
    return {
      progress: this.getProgress(),
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      rateLimits: {
        messagesLastMinute: this.messageCounts.lastMinute,
        messagesLastHour: this.messageCounts.lastHour,
        maxPerMinute: this.config.maxMessagesPerMinute,
        maxPerHour: this.config.maxMessagesPerHour
      }
    }
  }

  /**
   * Para o processamento
   */
  stop(): void {
    this.isProcessing = false
  }

  /**
   * Limpa a fila
   */
  clear(): void {
    this.queue = []
    this.isProcessing = false
    this.progress = {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      currentBatch: 0,
      totalBatches: 0,
      estimatedTimeRemaining: 0
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export { BroadcastQueue, type BroadcastConfig, type BroadcastMessage, type BroadcastProgress } 