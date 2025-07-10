import { Pool, PoolClient } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  host: process.env['POSTGRES_HOST'] || 'localhost',
  port: parseInt(process.env['POSTGRES_PORT'] || '5432'),
  database: process.env['POSTGRES_DB'] || 'catalog',
  user: process.env['POSTGRES_USER'] || 'postgres',
  password: process.env['POSTGRES_PASSWORD'] || 'example',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Função para configurar RLS (Row Level Security)
export async function setupRLS(client: PoolClient, tenantId: string): Promise<void> {
  // Define o tenant_id para a sessão atual
  await client.query('SET app.tenant_id = $1', [tenantId])
}

// Função para obter conexão com RLS configurado
export async function getClientWithRLS(tenantId: string): Promise<PoolClient> {
  const client = await pool.connect()
  await setupRLS(client, tenantId)
  return client
}

// Função para obter conexão padrão
export async function getClient(): Promise<PoolClient> {
  return await pool.connect()
}

// Função para executar query com RLS
export async function queryWithRLS<T = any>(
  tenantId: string,
  text: string,
  params?: any[]
): Promise<T[]> {
  const client = await getClientWithRLS(tenantId)
  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

// Função para executar query sem RLS (admin)
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await getClient()
  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

export default pool 