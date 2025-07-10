-- Script de criação de schema para Supabase (PostgreSQL)
-- Compatível com o schema do PocketBase (pb_schema.json)

-- Tabela de clientes/tenants
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  dominio VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de configuração de clientes (theming, etc)
CREATE TABLE IF NOT EXISTS clientes_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente UUID REFERENCES clientes(id) ON DELETE CASCADE,
  cor_primary VARCHAR(50),
  font VARCHAR(100),
  confirma_inscricoes BOOLEAN,
  dominio VARCHAR(255) NOT NULL,
  nome VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de campos (áreas de atuação, etc)
CREATE TABLE IF NOT EXISTS campos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cliente UUID REFERENCES clientes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  cliente UUID REFERENCES clientes(id),
  role VARCHAR(50) NOT NULL DEFAULT 'usuario',
  telefone VARCHAR(30),
  cpf VARCHAR(20),
  data_nascimento DATE,
  genero VARCHAR(20),
  endereco VARCHAR(255),
  numero INTEGER,
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(50),
  cep VARCHAR(20),
  email_visibility BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  campo UUID REFERENCES campos(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  cliente UUID REFERENCES clientes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  categoria UUID REFERENCES categorias(id),
  cliente UUID REFERENCES clientes(id),
  imagens TEXT[],
  tamanhos TEXT[],
  cores TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES usuarios(id),
  produto_ids UUID[] NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'criado',
  cliente UUID REFERENCES clientes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de transações de comissão
CREATE TABLE IF NOT EXISTS commission_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id),
  user_id UUID REFERENCES usuarios(id),
  valor_bruto DECIMAL(10,2) NOT NULL,
  fee_fixed DECIMAL(10,2) NOT NULL,
  fee_percent DECIMAL(5,4) NOT NULL,
  split JSONB NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  installments INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  cliente UUID REFERENCES clientes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_config ENABLE ROW LEVEL SECURITY;

-- Policy: cada tenant só vê seus próprios dados
CREATE POLICY "Tenant can access own data" ON usuarios
  USING (cliente = auth.uid()) WITH CHECK (cliente = auth.uid());
CREATE POLICY "Tenant can access own data" ON categorias
  USING (cliente = auth.uid()) WITH CHECK (cliente = auth.uid());
CREATE POLICY "Tenant can access own data" ON produtos
  USING (cliente = auth.uid()) WITH CHECK (cliente = auth.uid());
CREATE POLICY "Tenant can access own data" ON pedidos
  USING (cliente = auth.uid()) WITH CHECK (cliente = auth.uid());
CREATE POLICY "Tenant can access own data" ON commission_transactions
  USING (cliente = auth.uid()) WITH CHECK (cliente = auth.uid());
CREATE POLICY "Tenant can access own data" ON campos
  USING (cliente = auth.uid()) WITH CHECK (cliente = auth.uid());
CREATE POLICY "Tenant can access own data" ON clientes_config
  USING (cliente = auth.uid()) WITH CHECK (cliente = auth.uid());

-- Exemplo de inserção de cliente e usuário de teste
INSERT INTO clientes (id, nome, dominio) VALUES ('00000000-0000-0000-0000-000000000001', 'Tenant Teste', 'localhost') ON CONFLICT DO NOTHING;
INSERT INTO usuarios (id, nome, email, senha, cliente, role) VALUES ('00000000-0000-0000-0000-000000000002', 'Usuário Teste', 'teste@teste.com', 'senha123', '00000000-0000-0000-0000-000000000001', 'admin') ON CONFLICT DO NOTHING; 