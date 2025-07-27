-- =============================================================================
-- SCRIPTS DE MIGRAÇÃO POCKETBASE - SISTEMA DE FORNECEDORES
-- =============================================================================
-- Execute estes scripts no PocketBase Admin > Settings > Logs and backups > Console
-- ou via API de migração do PocketBase

-- -----------------------------------------------------------------------------
-- 1. CRIAR ÍNDICES PARA COLEÇÃO VENDORS
-- -----------------------------------------------------------------------------

-- Índice único para email por cliente (evita emails duplicados por tenant)
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendors_email_cliente 
ON vendors (email, cliente);

-- Índice único para documento por cliente (evita CPF/CNPJ duplicados por tenant)
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendors_documento_cliente 
ON vendors (documento, cliente);

-- Índice para consultas por status e cliente
CREATE INDEX IF NOT EXISTS idx_vendors_status_cliente 
ON vendors (status, cliente);

-- Índice para quem criou o fornecedor
CREATE INDEX IF NOT EXISTS idx_vendors_created_by 
ON vendors (created_by);

-- -----------------------------------------------------------------------------
-- 2. CRIAR ÍNDICES PARA COLEÇÃO COMISSOES
-- -----------------------------------------------------------------------------

-- Índice para consultas de comissões por fornecedor e status
CREATE INDEX IF NOT EXISTS idx_comissoes_vendor_status 
ON comissoes (vendor_id, status);

-- Índice para relacionamento com pedidos
CREATE INDEX IF NOT EXISTS idx_comissoes_pedido 
ON comissoes (pedido_id);

-- Índice para relatórios por cliente e data
CREATE INDEX IF NOT EXISTS idx_comissoes_cliente_data 
ON comissoes (cliente, data_venda);

-- Índice para comissões liberadas por data
CREATE INDEX IF NOT EXISTS idx_comissoes_status_liberacao 
ON comissoes (status, data_liberacao);

-- -----------------------------------------------------------------------------
-- 3. CRIAR ÍNDICES PARA COLEÇÃO SAQUES_COMISSAO
-- -----------------------------------------------------------------------------

-- Índice para saques por fornecedor e status
CREATE INDEX IF NOT EXISTS idx_saques_vendor_status 
ON saques_comissao (vendor_id, status);

-- Índice para relatórios de saques por cliente
CREATE INDEX IF NOT EXISTS idx_saques_cliente_data 
ON saques_comissao (cliente, data_solicitacao);

-- -----------------------------------------------------------------------------
-- 4. CRIAR ÍNDICES PARA COLEÇÃO PRODUTO_AVALIACOES
-- -----------------------------------------------------------------------------

-- Índice para avaliações por produto e status
CREATE INDEX IF NOT EXISTS idx_avaliacoes_produto_status 
ON produto_avaliacoes (produto_id, status);

-- Índice para relatórios por cliente
CREATE INDEX IF NOT EXISTS idx_avaliacoes_cliente_data 
ON produto_avaliacoes (cliente, created);

-- -----------------------------------------------------------------------------
-- 5. CRIAR ÍNDICES PARA COLEÇÃO VENDOR_ANALYTICS
-- -----------------------------------------------------------------------------

-- Índice único para analytics por fornecedor e período
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_vendor_periodo 
ON vendor_analytics (vendor_id, periodo);

-- Índice para relatórios por cliente e período
CREATE INDEX IF NOT EXISTS idx_analytics_cliente_periodo 
ON vendor_analytics (cliente, periodo);

-- -----------------------------------------------------------------------------
-- 6. CRIAR ÍNDICES PARA COLEÇÃO VENDOR_NOTIFICATIONS
-- -----------------------------------------------------------------------------

-- Índice para notificações por fornecedor e status de leitura
CREATE INDEX IF NOT EXISTS idx_notifications_vendor_lida 
ON vendor_notifications (vendor_id, lida);

-- Índice para relatórios por cliente
CREATE INDEX IF NOT EXISTS idx_notifications_cliente_created 
ON vendor_notifications (cliente, created);

-- -----------------------------------------------------------------------------
-- 7. CRIAR ÍNDICES PARA COLEÇÃO MARKETPLACE_CONFIG
-- -----------------------------------------------------------------------------

-- Índice único para configuração por cliente
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_config_cliente 
ON marketplace_config (cliente);

-- -----------------------------------------------------------------------------
-- 8. CRIAR NOVOS ÍNDICES PARA COLEÇÃO PRODUTOS (MODIFICADA)
-- -----------------------------------------------------------------------------

-- Índice para produtos por fornecedor e status de moderação
CREATE INDEX IF NOT EXISTS idx_produtos_vendor_moderacao 
ON produtos (vendor_id, moderacao_status);

-- Índice para produtos visíveis na loja
CREATE INDEX IF NOT EXISTS idx_produtos_cliente_aprovado 
ON produtos (cliente, aprovado, ativo);

-- Índice para produtos por criador e status
CREATE INDEX IF NOT EXISTS idx_produtos_created_by_moderacao 
ON produtos (created_by, moderacao_status);

-- Índice para produtos em destaque
CREATE INDEX IF NOT EXISTS idx_produtos_destaque_aprovado 
ON produtos (destaque, aprovado);

-- -----------------------------------------------------------------------------
-- 9. CRIAR NOVOS ÍNDICES PARA COLEÇÃO PEDIDOS (MODIFICADA)
-- -----------------------------------------------------------------------------

-- Índice para processamento de comissões
CREATE INDEX IF NOT EXISTS idx_pedidos_comissao_calculada 
ON pedidos (comissao_calculada, status);

-- -----------------------------------------------------------------------------
-- 10. VERIFICAR ÍNDICES CRIADOS
-- -----------------------------------------------------------------------------

-- Use este comando para verificar se os índices foram criados corretamente:
-- SELECT name, sql FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%';

-- =============================================================================
-- VALORES PADRÃO PARA CONFIGURAÇÕES
-- =============================================================================

-- Inserir configuração padrão do marketplace para um cliente específico
-- SUBSTITUA 'CLIENT_ID' pelo ID real do cliente

/*
INSERT INTO marketplace_config (
    id,
    cliente,
    habilitado,
    comissao_padrao,
    valor_minimo_saque,
    taxa_saque,
    periodo_retencao_dias,
    moderacao_produtos,
    auto_aprovar_vendors,
    categorias_permitidas,
    formas_pagamento_comissao,
    notificar_novo_vendor,
    notificar_novo_produto,
    notificar_venda,
    created,
    updated
) VALUES (
    'config_' || hex(randomblob(7)),
    'CLIENT_ID', -- SUBSTITUA pelo ID do cliente
    true,
    25,
    20,
    5,
    7,
    true,
    false,
    '["kits", "camisetas", "acessorios", "canecas", "livros"]',
    '["pix", "ted", "doc"]',
    true,
    true,
    true,
    datetime('now'),
    datetime('now')
);
*/

-- =============================================================================
-- CONSULTAS ÚTEIS PARA DEBUGGING
-- =============================================================================

-- Verificar fornecedores por status
-- SELECT status, COUNT(*) as total FROM vendors GROUP BY status;

-- Verificar produtos por status de moderação
-- SELECT moderacao_status, COUNT(*) as total FROM produtos WHERE vendor_id IS NOT NULL GROUP BY moderacao_status;

-- Verificar comissões por status
-- SELECT status, COUNT(*) as total, SUM(valor_comissao) as total_valor FROM comissoes GROUP BY status;

-- Verificar performance dos fornecedores (top 10)
-- SELECT v.nome, COUNT(c.id) as vendas, SUM(c.valor_comissao) as comissao_total
-- FROM vendors v
-- LEFT JOIN comissoes c ON v.id = c.vendor_id
-- GROUP BY v.id, v.nome
-- ORDER BY comissao_total DESC
-- LIMIT 10;

-- =============================================================================
-- TRIGGERS ÚTEIS (OPCIONAL)
-- =============================================================================

-- Trigger para auto-gerar analytics mensais
/*
CREATE TRIGGER IF NOT EXISTS update_vendor_analytics
AFTER INSERT ON comissoes
WHEN NEW.status = 'paga'
BEGIN
    INSERT OR REPLACE INTO vendor_analytics (
        id,
        vendor_id,
        periodo,
        vendas_quantidade,
        vendas_valor,
        comissao_valor,
        ticket_medio,
        cliente,
        created,
        updated
    )
    SELECT 
        COALESCE(va.id, 'analytics_' || hex(randomblob(7))),
        NEW.vendor_id,
        strftime('%Y-%m', NEW.data_venda),
        COALESCE(va.vendas_quantidade, 0) + 1,
        COALESCE(va.vendas_valor, 0) + NEW.valor_venda,
        COALESCE(va.comissao_valor, 0) + NEW.valor_comissao,
        (COALESCE(va.vendas_valor, 0) + NEW.valor_venda) / (COALESCE(va.vendas_quantidade, 0) + 1),
        NEW.cliente,
        COALESCE(va.created, datetime('now')),
        datetime('now')
    FROM vendors v
    LEFT JOIN vendor_analytics va ON va.vendor_id = NEW.vendor_id 
        AND va.periodo = strftime('%Y-%m', NEW.data_venda)
    WHERE v.id = NEW.vendor_id;
END;
*/

-- =============================================================================
-- LIMPEZA E MANUTENÇÃO
-- =============================================================================

-- Limpar notificações antigas (mais de 90 dias)
-- DELETE FROM vendor_notifications WHERE created < datetime('now', '-90 days');

-- Atualizar status de comissões antigas (liberar após período de retenção)
-- UPDATE comissoes 
-- SET status = 'liberada', data_liberacao = datetime('now')
-- WHERE status = 'pendente' 
-- AND date(data_venda, '+7 days') <= date('now');

-- =============================================================================
-- BACKUP E RESTORE
-- =============================================================================

-- Para fazer backup das configurações:
-- .output marketplace_config_backup.sql
-- .dump marketplace_config

-- Para fazer backup de fornecedores:
-- .output vendors_backup.sql  
-- .dump vendors

-- =============================================================================
-- VALIDAÇÕES DE DADOS
-- =============================================================================

-- Verificar fornecedores sem dados bancários completos
-- SELECT id, nome, banco, agencia, conta 
-- FROM vendors 
-- WHERE banco IS NULL OR agencia IS NULL OR conta IS NULL;

-- Verificar produtos órfãos (sem fornecedor)
-- SELECT id, nome FROM produtos WHERE vendor_id IS NULL AND origem = 'vendor';

-- Verificar comissões sem pedido relacionado
-- SELECT c.id, c.pedido_id FROM comissoes c 
-- LEFT JOIN pedidos p ON c.pedido_id = p.id 
-- WHERE p.id IS NULL;

-- =============================================================================
-- FIM DOS SCRIPTS
-- =============================================================================