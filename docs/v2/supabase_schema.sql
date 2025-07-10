-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- =========================
-- TABELA: tenants
-- =========================
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- =========================
-- TABELA: users
-- =========================
create table users (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null unique,
  password_hash text not null,
  name text,
  role text not null, -- ex: 'admin', 'lider', 'user'
  created_at timestamp with time zone default now()
);

-- =========================
-- TABELA: leaders
-- =========================
create table leaders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  area_of_expertise text not null, -- campo obrigatório
  created_at timestamp with time zone default now()
);

-- =========================
-- TABELA: categories
-- =========================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone default now()
);

-- =========================
-- TABELA: products
-- =========================
create table products (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12,2) not null,
  stock integer default 0,
  created_at timestamp with time zone default now()
);

-- =========================
-- TABELA: orders
-- =========================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references users(id) on delete set null,
  status text not null, -- ex: 'pending', 'paid', 'cancelled'
  total numeric(12,2) not null,
  created_at timestamp with time zone default now()
);

-- =========================
-- TABELA: order_items
-- =========================
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete set null,
  quantity integer not null,
  price numeric(12,2) not null
);

-- =========================
-- TABELA: commissions
-- =========================
create table commissions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  leader_id uuid not null references leaders(id) on delete set null,
  order_id uuid not null references orders(id) on delete set null,
  amount numeric(12,2) not null,
  status text not null, -- ex: 'pending', 'paid'
  created_at timestamp with time zone default now()
);

-- =========================
-- Ativar RLS em todas as tabelas
-- =========================
alter table tenants enable row level security;
alter table users enable row level security;
alter table leaders enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table commissions enable row level security;

-- =========================
-- Policies multi-tenant (exemplo para users, repetir para as demais)
-- =========================
-- Permitir SELECT apenas para registros do tenant atual
create policy "Select own tenant users"
  on users for select
  using (tenant_id::text = current_setting('app.tenant_id', true));

-- Permitir INSERT apenas para o tenant atual
create policy "Insert own tenant users"
  on users for insert
  with check (tenant_id::text = current_setting('app.tenant_id', true));

-- Permitir UPDATE apenas para o tenant atual
create policy "Update own tenant users"
  on users for update
  using (tenant_id::text = current_setting('app.tenant_id', true));

-- Permitir DELETE apenas para o tenant atual
create policy "Delete own tenant users"
  on users for delete
  using (tenant_id::text = current_setting('app.tenant_id', true));

-- Repita as policies acima para as demais tabelas (leaders, categories, products, orders, commissions, etc).

-- =========================
-- Índices e constraints extras (exemplo)
-- =========================
create index idx_users_tenant_id on users(tenant_id);
create index idx_leaders_tenant_id on leaders(tenant_id);
create index idx_categories_tenant_id on categories(tenant_id);
create index idx_products_tenant_id on products(tenant_id);
create index idx_orders_tenant_id on orders(tenant_id);
create index idx_commissions_tenant_id on commissions(tenant_id);

-- Adicione constraints e índices extras conforme necessário para performance e integridade.

-- =========================
-- Observações
-- =========================
-- 1. Adapte os campos extras conforme o schema do PocketBase.
-- 2. Se precisar de tabelas auxiliares (ex: logs, notificações), posso incluir.
-- 3. Se preferir IDs como TEXT, basta trocar uuid por text e remover default uuid_generate_v4().
-- 4. Policies podem ser refinadas para cada caso de uso (ex: admin pode ver tudo, user só vê o próprio registro).