import { query } from '../database/connection'

export async function runMigrations(): Promise<void> {
  console.log('🚀 Iniciando migrações do Catalog Service...')

  try {
    // 1. Criar extensão para UUID se não existir
    await query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `)

    // 2. Criar schema app se não existir
    await query(`
      CREATE SCHEMA IF NOT EXISTS app;
    `)

    // 3. Criar tabela de produtos
    await query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(255) NOT NULL,
        user_org VARCHAR(255) NOT NULL,
        quantidade INTEGER NOT NULL DEFAULT 0,
        preco DECIMAL(10,2) NOT NULL,
        preco_bruto DECIMAL(10,2) NOT NULL,
        ativo BOOLEAN NOT NULL DEFAULT true,
        tamanhos TEXT[],
        imagens TEXT[],
        descricao TEXT,
        detalhes TEXT,
        categoria UUID REFERENCES categorias(id),
        slug VARCHAR(255) NOT NULL UNIQUE,
        cores TEXT[],
        generos TEXT[],
        cliente UUID NOT NULL,
        exclusivo_user BOOLEAN DEFAULT false,
        requer_inscricao_aprovada BOOLEAN DEFAULT false,
        evento_id UUID,
        created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // 4. Criar tabela de categorias
    await query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        cliente UUID NOT NULL,
        created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // 5. Habilitar RLS nas tabelas
    await query(`
      ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
      ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
    `)

    // 6. Criar políticas RLS para produtos
    await query(`
      DROP POLICY IF EXISTS produtos_tenant_isolation ON produtos;
      CREATE POLICY produtos_tenant_isolation ON produtos
        FOR ALL
        USING (cliente::text = current_setting('app.tenant_id', true));
    `)

    // 7. Criar políticas RLS para categorias
    await query(`
      DROP POLICY IF EXISTS categorias_tenant_isolation ON categorias;
      CREATE POLICY categorias_tenant_isolation ON categorias
        FOR ALL
        USING (cliente::text = current_setting('app.tenant_id', true));
    `)

    // 8. Criar índices para performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_produtos_cliente ON produtos(cliente);
      CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug);
      CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
      CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
      CREATE INDEX IF NOT EXISTS idx_categorias_cliente ON categorias(cliente);
      CREATE INDEX IF NOT EXISTS idx_categorias_slug ON categorias(slug);
    `)

    // 9. Criar trigger para updated timestamp
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)

    await query(`
      DROP TRIGGER IF EXISTS update_produtos_updated ON produtos;
      CREATE TRIGGER update_produtos_updated
        BEFORE UPDATE ON produtos
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_column();
    `)

    await query(`
      DROP TRIGGER IF EXISTS update_categorias_updated ON categorias;
      CREATE TRIGGER update_categorias_updated
        BEFORE UPDATE ON categorias
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_column();
    `)

    console.log('✅ Migrações concluídas com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante migrações:', error)
    throw error
  }
}

// Executar migrações se chamado diretamente
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 Migrações finalizadas!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Falha nas migrações:', error)
      process.exit(1)
    })
} 