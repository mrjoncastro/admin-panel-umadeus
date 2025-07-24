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
-- TABELA: vendedores (MARKETPLACE - FASE 1)
-- =========================
create table vendedores (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text not null unique,
  telefone text,
  cpf_cnpj text not null unique,
  tipo_pessoa text not null check (tipo_pessoa in ('fisica', 'juridica')),
  razao_social text, -- para PJ
  nome_fantasia text, -- para PJ
  endereco text,
  cidade text,
  estado text,
  cep text,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado', 'suspenso')),
  taxa_comissao decimal(5,2) default 15.00, -- taxa padrão de 15%
  bio text,
  logo_url text,
  banner_url text,
  site_url text,
  instagram text,
  facebook text,
  whatsapp text,
  -- Dados bancários
  banco text,
  agencia text,
  conta text,
  tipo_conta text check (tipo_conta in ('corrente', 'poupanca')),
  pix_key text,
  -- Configurações
  aceita_devolvidos boolean default true,
  tempo_processamento integer default 2, -- dias úteis
  politica_troca text,
  politica_devolucao text,
  -- Métricas
  total_vendas integer default 0,
  total_produtos integer default 0,
  avaliacao_media decimal(3,2) default 0.00,
  total_avaliacoes integer default 0,
  -- Multi-tenant
  cliente uuid not null references m24_clientes(id) on delete cascade,
  -- Auditoria
  aprovado_por uuid references usuarios(id),
  aprovado_em timestamp with time zone,
  rejeitado_motivo text,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: vendedores_documentos (KYC)
-- =========================
create table vendedores_documentos (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  tipo_documento text not null check (tipo_documento in ('rg', 'cpf', 'cnpj', 'contrato_social', 'comprovante_endereco', 'comprovante_bancario')),
  nome_arquivo text not null,
  url_arquivo text not null,
  verificado boolean default false,
  verificado_por uuid references usuarios(id),
  verificado_em timestamp with time zone,
  observacoes text,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: produtos_vendedores (ATUALIZAÇÃO PARA MARKETPLACE)
-- =========================
-- Adicionar campos de vendedor à tabela produtos existente
alter table produtos add column vendedor_id uuid references vendedores(id);
alter table produtos add column status_aprovacao text default 'aprovado' check (status_aprovacao in ('pendente', 'aprovado', 'rejeitado'));
alter table produtos add column aprovado_por uuid references usuarios(id);
alter table produtos add column aprovado_em timestamp with time zone;
alter table produtos add column rejeitado_motivo text;
alter table produtos add column custo decimal(10,2); -- custo para o vendedor
alter table produtos add column margem_vendedor decimal(5,2) default 0.00; -- margem do vendedor

-- =========================
-- TABELA: avaliacoes_vendedores
-- =========================
create table avaliacoes_vendedores (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  pedido_id uuid references pedidos(id),
  nota integer not null check (nota >= 1 and nota <= 5),
  comentario text,
  resposta_vendedor text,
  respondido_em timestamp with time zone,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now(),
  unique(vendedor_id, usuario_id, pedido_id)
);

-- =========================
-- TABELA: mensagens_vendedores (Chat básico)
-- =========================
create table mensagens_vendedores (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  produto_id uuid references produtos(id),
  remetente text not null check (remetente in ('vendedor', 'usuario')),
  mensagem text not null,
  lida boolean default false,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: comissoes_vendedores (Histórico de comissões)
-- =========================
create table comissoes_vendedores (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  pedido_id uuid not null references pedidos(id) on delete cascade,
  produto_id uuid not null references produtos(id) on delete cascade,
  valor_produto decimal(10,2) not null,
  valor_comissao decimal(10,2) not null,
  taxa_comissao decimal(5,2) not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'cancelado')),
  data_pagamento timestamp with time zone,
  observacoes text,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- ÍNDICES PARA PERFORMANCE
-- =========================
create index idx_vendedores_email on vendedores(email);
create index idx_vendedores_cpf_cnpj on vendedores(cpf_cnpj);
create index idx_vendedores_status on vendedores(status);
create index idx_vendedores_cliente on vendedores(cliente);
create index idx_vendedores_documentos_vendedor on vendedores_documentos(vendedor_id);
create index idx_produtos_vendedor on produtos(vendedor_id);
create index idx_produtos_status_aprovacao on produtos(status_aprovacao);
create index idx_avaliacoes_vendedores_vendedor on avaliacoes_vendedores(vendedor_id);
create index idx_mensagens_vendedores_vendedor on mensagens_vendedores(vendedor_id);
create index idx_mensagens_vendedores_usuario on mensagens_vendedores(usuario_id);
create index idx_comissoes_vendedores_vendedor on comissoes_vendedores(vendedor_id);
create index idx_comissoes_vendedores_status on comissoes_vendedores(status);

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

-- RLS para novas tabelas de marketplace
alter table vendedores enable row level security;
alter table vendedores_documentos enable row level security;
alter table avaliacoes_vendedores enable row level security;
alter table mensagens_vendedores enable row level security;
alter table comissoes_vendedores enable row level security;

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

-- Policies para vendedores
create policy "Select own tenant vendors" on vendedores for select
  using (cliente::text = current_setting('app.tenant_id', true));

create policy "Insert own tenant vendors" on vendedores for insert
  with check (cliente::text = current_setting('app.tenant_id', true));

create policy "Update own tenant vendors" on vendedores for update
  using (cliente::text = current_setting('app.tenant_id', true));

create policy "Delete own tenant vendors" on vendedores for delete
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

-- =========================
-- TABELA: vendedores_auth (MARKETPLACE - FASE 2)
-- =========================
create table vendedores_auth (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  email text not null unique,
  password_hash text not null,
  token_reset text,
  token_reset_expires timestamp with time zone,
  last_login timestamp with time zone,
  login_attempts integer default 0,
  blocked_until timestamp with time zone,
  ativo boolean default true,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: vendedores_sessoes
-- =========================
create table vendedores_sessoes (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  token text not null unique,
  expires_at timestamp with time zone not null,
  user_agent text,
  ip_address text,
  created timestamp with time zone default now()
);

-- =========================
-- TABELA: produtos_aprovacao_historico
-- =========================
create table produtos_aprovacao_historico (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid not null references produtos(id) on delete cascade,
  status_anterior text not null,
  status_novo text not null,
  motivo text,
  aprovado_por uuid references usuarios(id),
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now()
);

-- =========================
-- TABELA: vendedores_estatisticas
-- =========================
create table vendedores_estatisticas (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  periodo date not null, -- data do período (diário)
  vendas_quantidade integer default 0,
  vendas_valor decimal(10,2) default 0.00,
  comissoes_valor decimal(10,2) default 0.00,
  produtos_visualizacoes integer default 0,
  produtos_novos integer default 0,
  avaliacoes_recebidas integer default 0,
  avaliacoes_media decimal(3,2) default 0.00,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now(),
  unique(vendedor_id, periodo, cliente)
);

-- =========================
-- TABELA: pedidos_vendedores (Split de pedidos)
-- =========================
create table pedidos_vendedores (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  produto_id uuid not null references produtos(id) on delete cascade,
  quantidade integer not null default 1,
  valor_produto decimal(10,2) not null,
  valor_custo decimal(10,2) not null,
  valor_comissao decimal(10,2) not null,
  taxa_comissao decimal(5,2) not null,
  status text not null default 'pendente' check (status in ('pendente', 'processando', 'enviado', 'entregue', 'cancelado')),
  codigo_rastreamento text,
  estimativa_entrega date,
  entregue_em timestamp with time zone,
  observacoes text,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: vendedores_repasses
-- =========================
create table vendedores_repasses (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  periodo_inicio date not null,
  periodo_fim date not null,
  valor_vendas decimal(10,2) not null,
  valor_comissoes decimal(10,2) not null,
  valor_taxas decimal(10,2) not null default 0.00,
  valor_liquido decimal(10,2) not null,
  status text not null default 'pendente' check (status in ('pendente', 'processando', 'pago', 'cancelado')),
  pago_em timestamp with time zone,
  comprovante_url text,
  observacoes text,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now(),
  updated timestamp with time zone default now()
);

-- =========================
-- TABELA: produtos_visualizacoes (Analytics)
-- =========================
create table produtos_visualizacoes (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid not null references produtos(id) on delete cascade,
  vendedor_id uuid references vendedores(id) on delete set null,
  usuario_id uuid references usuarios(id) on delete set null,
  ip_address text,
  user_agent text,
  referrer text,
  session_id text,
  tempo_visualizacao integer default 0, -- segundos
  origem text check (origem in ('loja', 'busca', 'categoria', 'vendedor', 'recomendacao')),
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now()
);

-- =========================
-- TABELA: vendedores_notificacoes
-- =========================
create table vendedores_notificacoes (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid not null references vendedores(id) on delete cascade,
  tipo text not null check (tipo in ('pedido', 'aprovacao', 'rejeicao', 'suspensao', 'pagamento', 'avaliacao', 'sistema')),
  titulo text not null,
  mensagem text not null,
  link text,
  lida boolean default false,
  lida_em timestamp with time zone,
  dados_extras jsonb,
  cliente uuid not null references m24_clientes(id) on delete cascade,
  created timestamp with time zone default now()
);

-- =========================
-- FUNÇÕES E TRIGGERS PARA ESTATÍSTICAS
-- =========================

-- Função para atualizar estatísticas do vendedor
create or replace function atualizar_estatisticas_vendedor()
returns trigger as $$
begin
  -- Inserir ou atualizar estatísticas diárias
  insert into vendedores_estatisticas (
    vendedor_id, 
    periodo, 
    vendas_quantidade, 
    vendas_valor, 
    comissoes_valor,
    cliente
  )
  select 
    pv.vendedor_id,
    current_date,
    count(*),
    sum(pv.valor_produto),
    sum(pv.valor_comissao),
    pv.cliente
  from pedidos_vendedores pv
  where pv.vendedor_id = coalesce(NEW.vendedor_id, OLD.vendedor_id)
    and date(pv.created) = current_date
  group by pv.vendedor_id, pv.cliente
  on conflict (vendedor_id, periodo, cliente) 
  do update set
    vendas_quantidade = excluded.vendas_quantidade,
    vendas_valor = excluded.vendas_valor,
    comissoes_valor = excluded.comissoes_valor,
    updated = now();
    
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

-- Trigger para atualizar estatísticas quando pedido_vendedor for modificado
create trigger trigger_atualizar_estatisticas_vendedor
  after insert or update or delete on pedidos_vendedores
  for each row execute function atualizar_estatisticas_vendedor();

-- Função para atualizar total de produtos do vendedor
create or replace function atualizar_total_produtos_vendedor()
returns trigger as $$
begin
  update vendedores 
  set total_produtos = (
    select count(*) 
    from produtos 
    where vendedor_id = coalesce(NEW.vendedor_id, OLD.vendedor_id)
      and ativo = true
      and status_aprovacao = 'aprovado'
  )
  where id = coalesce(NEW.vendedor_id, OLD.vendedor_id);
  
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

-- Trigger para atualizar total de produtos quando produto for modificado
create trigger trigger_atualizar_total_produtos_vendedor
  after insert or update or delete on produtos
  for each row 
  when (NEW.vendedor_id is not null or OLD.vendedor_id is not null)
  execute function atualizar_total_produtos_vendedor();

-- =========================
-- ÍNDICES PARA PERFORMANCE - FASE 2
-- =========================
create index idx_vendedores_auth_email on vendedores_auth(email);
create index idx_vendedores_auth_vendedor on vendedores_auth(vendedor_id);
create index idx_vendedores_sessoes_token on vendedores_sessoes(token);
create index idx_vendedores_sessoes_vendedor on vendedores_sessoes(vendedor_id);
create index idx_vendedores_sessoes_expires on vendedores_sessoes(expires_at);

create index idx_produtos_aprovacao_historico_produto on produtos_aprovacao_historico(produto_id);
create index idx_produtos_aprovacao_historico_status on produtos_aprovacao_historico(status_novo);

create index idx_vendedores_estatisticas_vendedor_periodo on vendedores_estatisticas(vendedor_id, periodo);
create index idx_vendedores_estatisticas_cliente on vendedores_estatisticas(cliente);

create index idx_pedidos_vendedores_pedido on pedidos_vendedores(pedido_id);
create index idx_pedidos_vendedores_vendedor on pedidos_vendedores(vendedor_id);
create index idx_pedidos_vendedores_status on pedidos_vendedores(status);

create index idx_vendedores_repasses_vendedor on vendedores_repasses(vendedor_id);
create index idx_vendedores_repasses_status on vendedores_repasses(status);
create index idx_vendedores_repasses_periodo on vendedores_repasses(periodo_inicio, periodo_fim);

create index idx_produtos_visualizacoes_produto on produtos_visualizacoes(produto_id);
create index idx_produtos_visualizacoes_vendedor on produtos_visualizacoes(vendedor_id);
create index idx_produtos_visualizacoes_created on produtos_visualizacoes(created);

create index idx_vendedores_notificacoes_vendedor on vendedores_notificacoes(vendedor_id);
create index idx_vendedores_notificacoes_tipo on vendedores_notificacoes(tipo);
create index idx_vendedores_notificacoes_lida on vendedores_notificacoes(lida);

-- =========================
-- RLS PARA NOVAS TABELAS - FASE 2
-- =========================
alter table vendedores_auth enable row level security;
alter table vendedores_sessoes enable row level security;
alter table produtos_aprovacao_historico enable row level security;
alter table vendedores_estatisticas enable row level security;
alter table pedidos_vendedores enable row level security;
alter table vendedores_repasses enable row level security;
alter table produtos_visualizacoes enable row level security;
alter table vendedores_notificacoes enable row level security;

-- Policies para vendedores_auth
create policy "Vendedores auth own data" on vendedores_auth for all
  using (vendedor_id in (
    select id from vendedores where cliente::text = current_setting('app.tenant_id', true)
  ));

-- Policies para demais tabelas (exemplo)
create policy "Vendedores stats own tenant" on vendedores_estatisticas for all
  using (cliente::text = current_setting('app.tenant_id', true));

create policy "Pedidos vendedores own tenant" on pedidos_vendedores for all
  using (cliente::text = current_setting('app.tenant_id', true));

create policy "Vendedores repasses own tenant" on vendedores_repasses for all
  using (cliente::text = current_setting('app.tenant_id', true));

create policy "Produtos visualizacoes own tenant" on produtos_visualizacoes for all
  using (cliente::text = current_setting('app.tenant_id', true));

create policy "Vendedores notificacoes own tenant" on vendedores_notificacoes for all
  using (cliente::text = current_setting('app.tenant_id', true));