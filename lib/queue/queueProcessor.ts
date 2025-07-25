import type PocketBase from 'pocketbase'
import type { QueueJob } from '../../types/marketplace'
import createPocketBase from '../pocketbase'
import { calcularComissao } from '../services/marketplace'
import { sendEmail } from '../email'

interface QueueProcessor {
  process(): Promise<void>
  isRunning: boolean
  stop(): void
}

class MarketplaceQueueProcessor implements QueueProcessor {
  private pb: PocketBase
  private intervalId: NodeJS.Timeout | null = null
  private processing = false
  public isRunning = false
  
  constructor() {
    this.pb = createPocketBase()
  }

  async start(intervalMs: number = 5000) {
    if (this.isRunning) {
      console.log('Queue processor já está rodando')
      return
    }

    this.isRunning = true
    console.log('Iniciando queue processor...')

    // Processar jobs imediatamente
    this.process()

    // Configurar processamento contínuo
    this.intervalId = setInterval(() => {
      if (!this.processing) {
        this.process()
      }
    }, intervalMs)
  }

  stop() {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    console.log('Queue processor parado')
  }

  async process(): Promise<void> {
    if (this.processing) return
    
    this.processing = true
    
    try {
      // Buscar jobs pendentes ordenados por prioridade e data
      const jobs = await this.pb.collection('queue_jobs').getList(1, 10, {
        filter: 'status = "pendente"',
        sort: 'prioridade,created'
      })

      for (const job of jobs.items) {
        await this.processJob(job as QueueJob)
      }
    } catch (error) {
      console.error('Erro no processamento da queue:', error)
    } finally {
      this.processing = false
    }
  }

  private async processJob(job: QueueJob): Promise<void> {
    try {
      // Marcar como processando
      await this.pb.collection('queue_jobs').update(job.id, {
        status: 'processando',
        processado_em: new Date().toISOString()
      })

      // Processar baseado no tipo
      await this.executeJob(job)

      // Marcar como concluído
      await this.pb.collection('queue_jobs').update(job.id, {
        status: 'concluido'
      })

      console.log(`Job ${job.id} processado com sucesso`)

    } catch (error) {
      console.error(`Erro ao processar job ${job.id}:`, error)
      
      const newTentativas = job.tentativas + 1
      
      if (newTentativas >= job.max_tentativas) {
        // Marcar como falhou se excedeu tentativas
        await this.pb.collection('queue_jobs').update(job.id, {
          status: 'falhou',
          tentativas: newTentativas,
          erro: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      } else {
        // Reagendar para nova tentativa
        const proximaTentativa = new Date()
        proximaTentativa.setMinutes(proximaTentativa.getMinutes() + (newTentativas * 5)) // Backoff exponencial

        await this.pb.collection('queue_jobs').update(job.id, {
          status: 'pendente',
          tentativas: newTentativas,
          agendado_para: proximaTentativa.toISOString(),
          erro: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }
  }

  private async executeJob(job: QueueJob): Promise<void> {
    switch (job.tipo) {
      case 'calcular_comissao':
        await this.processarComissao(job)
        break
      
      case 'enviar_email':
        await this.processarEmail(job)
        break
      
      case 'atualizar_analytics':
        await this.processarAnalytics(job)
        break
      
      case 'moderar_produto':
        await this.processarModeracaoProduto(job)
        break
      
      case 'processar_saque':
        await this.processarSaque(job)
        break
      
      default:
        throw new Error(`Tipo de job não suportado: ${job.tipo}`)
    }
  }

  private async processarComissao(job: QueueJob): Promise<void> {
    const { vendorId, pedidoId, produtoId, valorVenda, percentualComissao, tenantId } = job.payload
    
    await calcularComissao(
      vendorId,
      pedidoId,
      produtoId,
      valorVenda,
      percentualComissao,
      tenantId,
      this.pb
    )
  }

  private async processarEmail(job: QueueJob): Promise<void> {
    const { to, subject, template, data } = job.payload
    
    await sendEmail({
      to,
      subject,
      template,
      data
    })
  }

  private async processarAnalytics(job: QueueJob): Promise<void> {
    const { vendorId, periodo, tenantId } = job.payload
    
    // Implementar lógica de analytics
    // Por exemplo, calcular métricas mensais do vendor
    console.log(`Processando analytics para vendor ${vendorId}, período ${periodo}`)
  }

  private async processarModeracaoProduto(job: QueueJob): Promise<void> {
    const { produtoId, tenantId } = job.payload
    
    // Implementar lógica de moderação automática
    // Por exemplo, verificar conteúdo inadequado
    console.log(`Moderando produto ${produtoId}`)
  }

  private async processarSaque(job: QueueJob): Promise<void> {
    const { saqueId, tenantId } = job.payload
    
    // Implementar lógica de processamento de saque
    // Por exemplo, integração com API bancária
    console.log(`Processando saque ${saqueId}`)
  }
}

// Função para adicionar jobs na queue
export async function addQueueJob(
  tipo: QueueJob['tipo'],
  payload: Record<string, any>,
  prioridade: QueueJob['prioridade'] = 'media',
  tenantId: string,
  agendadoPara?: Date
): Promise<QueueJob> {
  const pb = createPocketBase()
  
  const jobData: Partial<QueueJob> = {
    tipo,
    payload,
    status: 'pendente',
    prioridade,
    tentativas: 0,
    max_tentativas: 3,
    cliente: tenantId,
    agendado_para: agendadoPara?.toISOString()
  }
  
  return pb.collection('queue_jobs').create(jobData)
}

// Função para processar comissões em batch
export async function processarComissoesBatch(
  pedidos: Array<{
    vendorId: string
    pedidoId: string
    produtoId: string
    valorVenda: number
    percentualComissao: number
  }>,
  tenantId: string
): Promise<void> {
  for (const pedido of pedidos) {
    await addQueueJob(
      'calcular_comissao',
      pedido,
      'alta',
      tenantId
    )
  }
}

// Função para agendar jobs recorrentes
export async function agendarJobsRecorrentes(tenantId: string): Promise<void> {
  const proximoMes = new Date()
  proximoMes.setMonth(proximoMes.getMonth() + 1)
  proximoMes.setDate(1)
  proximoMes.setHours(0, 0, 0, 0)

  // Agendar processamento de analytics mensal
  await addQueueJob(
    'atualizar_analytics',
    { tipo: 'mensal', tenantId },
    'baixa',
    tenantId,
    proximoMes
  )
}

// Sistema de monitoramento da queue
export class QueueMonitor {
  private pb: PocketBase

  constructor() {
    this.pb = createPocketBase()
  }

  async getQueueStats(tenantId?: string): Promise<{
    pendentes: number
    processando: number
    concluidos: number
    falharam: number
    totalHoje: number
  }> {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    let baseFilter = `created >= "${hoje.toISOString()}"`
    if (tenantId) {
      baseFilter += ` && cliente = "${tenantId}"`
    }

    const [pendentes, processando, concluidos, falharam, totalHoje] = await Promise.all([
      this.pb.collection('queue_jobs').getList(1, 1, {
        filter: `${baseFilter} && status = "pendente"`
      }),
      this.pb.collection('queue_jobs').getList(1, 1, {
        filter: `${baseFilter} && status = "processando"`
      }),
      this.pb.collection('queue_jobs').getList(1, 1, {
        filter: `${baseFilter} && status = "concluido"`
      }),
      this.pb.collection('queue_jobs').getList(1, 1, {
        filter: `${baseFilter} && status = "falhou"`
      }),
      this.pb.collection('queue_jobs').getList(1, 1, {
        filter: baseFilter
      })
    ])

    return {
      pendentes: pendentes.totalItems,
      processando: processando.totalItems,
      concluidos: concluidos.totalItems,
      falharam: falharam.totalItems,
      totalHoje: totalHoje.totalItems
    }
  }

  async getJobsFalharam(tenantId?: string, limite = 10): Promise<QueueJob[]> {
    let filter = 'status = "falhou"'
    if (tenantId) {
      filter += ` && cliente = "${tenantId}"`
    }

    const result = await this.pb.collection('queue_jobs').getList(1, limite, {
      filter,
      sort: '-updated'
    })

    return result.items as QueueJob[]
  }

  async reprocessarJob(jobId: string): Promise<void> {
    await this.pb.collection('queue_jobs').update(jobId, {
      status: 'pendente',
      tentativas: 0,
      erro: null,
      agendado_para: null
    })
  }
}

// Instância global do processor
export const queueProcessor = new MarketplaceQueueProcessor()
export const queueMonitor = new QueueMonitor()

// Inicializar o processor se estivermos no servidor
if (typeof window === 'undefined') {
  // Iniciar o processor em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    queueProcessor.start(10000) // 10 segundos em dev
  } else {
    queueProcessor.start(5000) // 5 segundos em produção
  }
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Recebido SIGTERM, parando queue processor...')
    queueProcessor.stop()
  })
  
  process.on('SIGINT', () => {
    console.log('Recebido SIGINT, parando queue processor...')
    queueProcessor.stop()
  })
}