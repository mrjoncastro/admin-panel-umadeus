-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- =========================
-- TABELA: m24_clientes (tenants)
-- =========================
create table m24_clientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  dominio text not null unique,
  responsavel_email text,
  ativo boolean not null,
  documento text not null unique,
  asaas_account_id text not null,
  asaas_api_key text not null,
  verificado boolean,
  tipo_dominio text,
  modo_validacao text,
  usuario uuid not null,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: usuarios
-- =========================
create table usuarios (
  id uuid primary key default uuid_generate_v4(),
  password text not null,
  tokenKey text,
  email text not null unique,
  emailVisibility boolean,
  verified boolean,
  nome text,
  role text not null,
  campo uuid,
  telefone text,
  cpf text unique,
  data_nascimento date,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  endereco text,
  estado text,
  cep text,
  cidade text,
  numero text,
  bairro text,
  genero text,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: campos
-- =========================
create table campos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: categorias
-- =========================
create table categorias (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slug text not null,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: eventos
-- =========================
create table eventos (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  descricao text,
  data timestamp with time zone not null,
  cidade text,
  imagem text,
  status text not null,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  cobra_inscricao boolean,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);
create index idx_eventos_data on eventos(data);

-- =========================
-- TABELA: produtos
-- =========================
create table produtos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  user_org uuid not null references usuarios(id),
  quantidade integer not null check (quantidade >= 0),
  preco integer not null check (preco >= 0),
  preco_bruto integer not null,
  ativo boolean not null,
  tamanhos text[],
  imagens text[],
  descricao text,
  detalhes text,
  categoria uuid references categorias(id),
  slug text not null,
  cores text[],
  generos text[],
  cliente uuid not null references m24_clientes(id) on delete cascade,
  exclusivo_user boolean,
  requer_inscricao_aprovada boolean,
  evento_id uuid references eventos(id),
  publico boolean default false,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);
create index idx_produtos_slug on produtos(slug);

-- =========================
-- TABELA: posts
-- =========================
create table posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null,
  summary text,
  content text not null,
  category uuid references categorias(id),
  thumbnail text,
  keywords text[],
  cliente uuid not null references m24_clientes(id) on delete cascade,
  date date not null,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);
create index idx_posts_slug on posts(slug);
create index idx_posts_date on posts(date);

-- =========================
-- TABELA: inscricoes
-- =========================
create table inscricoes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text not null,
  telefone text not null,
  cpf text not null unique,
  campo uuid references campos(id),
  criado_por uuid references usuarios(id),
  status text not null,
  pedido uuid, -- apenas uuid, sem references
  genero text,
  tamanho text,
  evento uuid references eventos(id),
  paymentMethod text,
  data_nascimento date,
  confirmado_por_lider boolean not null,
  cliente uuid references m24_clientes(id) on delete cascade,
  aprovada boolean,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: pedidos
-- =========================
create table pedidos (
  id uuid primary key default uuid_generate_v4(),
  id_pagamento text not null,
  id_inscricao uuid references inscricoes(id),
  tamanho text,
  email text not null,
  status text not null,
  campo uuid references campos(id),
  responsavel uuid references usuarios(id),
  genero text,
  valor integer not null check (valor > 0),
  link_pagamento text not null,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  canal text not null,
  cor text,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);
create index idx_pedidos_id_pagamento on pedidos(id_pagamento);
create index idx_pedidos_email on pedidos(email);

-- Adicionar a constraint de foreign key após ambas existirem
alter table inscricoes
  add constraint fk_inscricoes_pedido
  foreign key (pedido) references pedidos(id);

-- =========================
-- TABELA: clientes_pix
-- =========================
create table clientes_pix (
  id uuid primary key default uuid_generate_v4(),
  pixAddressKey text not null,
  pixAddressKeyType text not null,
  description text,
  scheduleDate timestamp with time zone,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);
create index idx_clientes_pix_pixAddressKey on clientes_pix(pixAddressKey);

-- =========================
-- TABELA: clientes_contas_bancarias
-- =========================
create table clientes_contas_bancarias (
  id uuid primary key default uuid_generate_v4(),
  ownerName text not null,
  cpfCnpj text not null,
  accountName text not null,
  ownerBirthDate date,
  bankName text not null,
  bankCode text not null,
  ispb text not null,
  agency text not null,
  account text not null,
  accountDigit text not null,
  bankAccountType text not null,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);
create index idx_clientes_contas_bancarias_cpfCnpj on clientes_contas_bancarias(cpfCnpj);
create index idx_clientes_contas_bancarias_bankCode on clientes_contas_bancarias(bankCode);

-- =========================
-- TABELA: clientes_config
-- =========================
create table clientes_config (
  id uuid primary key default uuid_generate_v4(),
  cor_primary text,
  dominio text not null,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  font text,
  nome text,
  confirma_inscricoes boolean,
  logo text,
  smtpHost text,
  smtpPort integer,
  smtpSecure boolean,
  smtpUser text,
  smtpPass text,
  smtpFrom text,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: manifesto_clientes
-- =========================
create table manifesto_clientes (
  id uuid primary key default uuid_generate_v4(),
  cliente uuid not null references m24_clientes(id) on delete cascade,
  logo text,
  name text,
  short_name text,
  description text,
  theme_color text,
  background_color text,
  start_url text,
  display_default text,
  orientation_default text,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELAS DE RELACIONAMENTO (M:N)
-- =========================

-- produtos <-> eventos
create table produtos_eventos (
  produto_id uuid not null references produtos(id) on delete cascade,
  evento_id uuid not null references eventos(id) on delete cascade,
  primary key (produto_id, evento_id)
);

-- produtos <-> pedidos
create table pedidos_produtos (
  pedido_id uuid not null references pedidos(id) on delete cascade,
  produto_id uuid not null references produtos(id) on delete cascade,
  primary key (pedido_id, produto_id)
);

-- produtos <-> inscricoes
create table inscricoes_produtos (
  inscricao_id uuid not null references inscricoes(id) on delete cascade,
  produto_id uuid not null references produtos(id) on delete cascade,
  primary key (inscricao_id, produto_id)
);

-- =========================
-- Ativar RLS em todas as tabelas
-- =========================
alter table m24_clientes enable row level security;
alter table usuarios enable row level security;
alter table campos enable row level security;
alter table categorias enable row level security;
alter table eventos enable row level security;
alter table produtos enable row level security;
alter table posts enable row level security;
alter table inscricoes enable row level security;
alter table pedidos enable row level security;
alter table clientes_pix enable row level security;
alter table clientes_contas_bancarias enable row level security;
alter table clientes_config enable row level security;
alter table manifesto_clientes enable row level security;
alter table produtos_eventos enable row level security;
alter table pedidos_produtos enable row level security;
alter table inscricoes_produtos enable row level security;

-- =========================
-- Exemplo de policies multi-tenant (replicar para todas as tabelas)
-- =========================
drop policy if exists "Select own tenant" on produtos;
create policy "Select own or public products" on produtos for select
  using (
    cliente::text = current_setting('app.tenant_id', true)
    OR publico = true
  );

create policy "Insert own tenant" on produtos for insert
  with check (cliente::text = current_setting('app.tenant_id', true));

create policy "Update own tenant" on produtos for update
  using (cliente::text = current_setting('app.tenant_id', true));

create policy "Delete own tenant" on produtos for delete
  using (cliente::text = current_setting('app.tenant_id', true));

-- Repita as policies para as demais tabelas com campo cliente.

-- =========================
-- Índices extras sugeridos
-- =========================
create index idx_produtos_cliente on produtos(cliente);
create index idx_posts_cliente on posts(cliente);
create index idx_pedidos_cliente on pedidos(cliente);
create index idx_inscricoes_cliente on inscricoes(cliente);
create index idx_eventos_cliente on eventos(cliente);

-- Adapte conforme necessidade de performance.

-- FIM DO SCRIPT