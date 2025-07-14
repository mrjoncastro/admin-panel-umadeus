import { Pool, PoolClient } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Conexão compatível com Supabase/Postgres
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
  // Define o tenant_id para a sessão atual (ajuste conforme policy do Supabase)
  await client.query('SET app.tenant_id = $1', [tenantId])
}

export const query = (text: string, params?: unknown[]) =>
  pool.query(text, params as any[])
export const getClient = () => pool.connect()