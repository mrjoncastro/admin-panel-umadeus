import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BroadcastQueue } from '@/lib/server/flows/whatsapp/broadcastQueue'

// Mock da função sendTextMessage
vi.mock('@/lib/server/chats', () => ({
  sendTextMessage: vi.fn()
}))

describe('BroadcastQueue', () => {
  let queue: BroadcastQueue
  let mockSendTextMessage: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Importa a função mockada
    const chatsModule = require('@/lib/server/chats')
    mockSendTextMessage = chatsModule.sendTextMessage
    
    queue = new BroadcastQueue({
      delayBetweenMessages: 100, // Reduzido para testes
      delayBetweenBatches: 200,
      batchSize: 2,
      maxMessagesPerMinute: 10,
      maxMessagesPerHour: 50,
      maxRetries: 1,
      retryDelay: 100
    })
  })

  it('deve adicionar mensagens à fila', () => {
    const messages = [
      { to: '5511999999999', message: 'Teste 1', instanceName: 'test', apiKey: 'key' },
      { to: '5511888888888', message: 'Teste 2', instanceName: 'test', apiKey: 'key' }
    ]

    queue.addMessages(messages)
    const stats = queue.getStats()
    
    expect(stats.progress.total).toBe(2)
    expect(stats.progress.pending).toBe(2)
    expect(stats.progress.sent).toBe(0)
    expect(stats.progress.failed).toBe(0)
  })

  it('deve processar mensagens com sucesso', async () => {
    mockSendTextMessage.mockResolvedValue({ success: true })
    
    const messages = [
      { to: '5511999999999', message: 'Teste 1', instanceName: 'test', apiKey: 'key' },
      { to: '5511888888888', message: 'Teste 2', instanceName: 'test', apiKey: 'key' }
    ]

    queue.addMessages(messages)
    await queue.startProcessing()

    const stats = queue.getStats()
    expect(stats.progress.sent).toBe(2)
    expect(stats.progress.pending).toBe(0)
    expect(stats.progress.failed).toBe(0)
    expect(mockSendTextMessage).toHaveBeenCalledTimes(2)
  })

  it('deve lidar com falhas e retry', async () => {
    // Primeira tentativa falha, segunda sucesso
    mockSendTextMessage
      .mockRejectedValueOnce(new Error('Erro temporário'))
      .mockResolvedValueOnce({ success: true })
    
    const messages = [
      { to: '5511999999999', message: 'Teste', instanceName: 'test', apiKey: 'key' }
    ]

    queue.addMessages(messages)
    await queue.startProcessing()

    const stats = queue.getStats()
    expect(stats.progress.sent).toBe(1)
    expect(stats.progress.failed).toBe(0)
    expect(mockSendTextMessage).toHaveBeenCalledTimes(2) // 1 falha + 1 retry
  })

  it('deve falhar após máximo de tentativas', async () => {
    mockSendTextMessage.mockRejectedValue(new Error('Erro permanente'))
    
    const messages = [
      { to: '5511999999999', message: 'Teste', instanceName: 'test', apiKey: 'key' }
    ]

    queue.addMessages(messages)
    await queue.startProcessing()

    const stats = queue.getStats()
    expect(stats.progress.sent).toBe(0)
    expect(stats.progress.failed).toBe(1)
    expect(mockSendTextMessage).toHaveBeenCalledTimes(2) // 1 tentativa + 1 retry
  })

  it('deve respeitar limites de taxa', async () => {
    mockSendTextMessage.mockResolvedValue({ success: true })
    
    const messages = Array.from({ length: 5 }, (_, i) => ({
      to: `551199999999${i}`,
      message: `Teste ${i}`,
      instanceName: 'test',
      apiKey: 'key'
    }))

    queue.addMessages(messages)
    
    // Inicia processamento
    const processPromise = queue.startProcessing()
    
    // Aguarda um pouco para verificar se está respeitando os delays
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const stats = queue.getStats()
    expect(stats.progress.sent).toBeLessThanOrEqual(2) // batchSize = 2
    
    // Aguarda conclusão
    await processPromise
    
    expect(stats.progress.sent).toBe(5)
  })

  it('deve parar processamento quando solicitado', async () => {
    mockSendTextMessage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    const messages = [
      { to: '5511999999999', message: 'Teste', instanceName: 'test', apiKey: 'key' }
    ]

    queue.addMessages(messages)
    
    // Inicia processamento
    const processPromise = queue.startProcessing()
    
    // Para após um pouco
    setTimeout(() => queue.stop(), 100)
    
    await processPromise
    
    const stats = queue.getStats()
    expect(stats.isProcessing).toBe(false)
  })

  it('deve limpar a fila', () => {
    const messages = [
      { to: '5511999999999', message: 'Teste', instanceName: 'test', apiKey: 'key' }
    ]

    queue.addMessages(messages)
    queue.clear()

    const stats = queue.getStats()
    expect(stats.progress.total).toBe(0)
    expect(stats.progress.pending).toBe(0)
    expect(stats.queueLength).toBe(0)
  })

  it('deve calcular tempo estimado restante', async () => {
    mockSendTextMessage.mockResolvedValue({ success: true })
    
    const messages = Array.from({ length: 4 }, (_, i) => ({
      to: `551199999999${i}`,
      message: `Teste ${i}`,
      instanceName: 'test',
      apiKey: 'key'
    }))

    queue.addMessages(messages)
    await queue.startProcessing()

    const stats = queue.getStats()
    expect(stats.progress.estimatedTimeRemaining).toBeGreaterThan(0)
  })
}) 