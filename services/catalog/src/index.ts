import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Importar rotas
import productsRouter from './routes/v1/products'
import categoriesRouter from './routes/v1/categories'

// Importar migrações
import { runMigrations } from './migrations'

dotenv.config()

const app = express()
const PORT = process.env['CATALOG_PORT'] || 5000

// Middleware de segurança
app.use(helmet())

// CORS
app.use(cors({
  origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
  message: {
    success: false,
    error: 'Muitas requisições, tente novamente mais tarde'
  }
})
app.use(limiter)

// Logging
app.use(morgan('combined'))

// Parser de JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    service: 'catalog',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Rotas v1
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/categories', categoriesRouter)

// Middleware de erro global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err)
  
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env['NODE_ENV'] === 'development' ? err.message : undefined
  })
})

// Middleware para rotas não encontradas
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.originalUrl
  })
})

// Função para inicializar o servidor
async function startServer() {
  try {
    // Executar migrações se necessário
    if (process.env['RUN_MIGRATIONS'] === 'true') {
      console.log('🔄 Executando migrações...')
      await runMigrations()
      console.log('✅ Migrações concluídas')
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Catalog Service rodando na porta ${PORT}`)
      console.log(`📚 API v1 disponível em http://localhost:${PORT}/api/v1`)
      console.log(`🏥 Health check em http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('💥 Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

// Iniciar servidor se chamado diretamente
if (require.main === module) {
  startServer()
}

export default app 