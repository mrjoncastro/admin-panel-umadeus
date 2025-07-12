-- ========================================
-- ATIVAÇÃO DO ROW LEVEL SECURITY (RLS)
-- ========================================

-- Ativar RLS em todas as tabelas principais
ALTER TABLE m24_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE campos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifesto_clientes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLICIES PARA M24_CLIENTES
-- ========================================

-- Policy para permitir leitura de todos os clientes (para identificação de tenant)
CREATE POLICY "Permitir leitura de clientes" ON m24_clientes
    FOR SELECT USING (true);

-- Policy para permitir inserção apenas por admins
CREATE POLICY "Permitir inserção de clientes" ON m24_clientes
    FOR INSERT WITH CHECK (auth.role() = 'admin');

-- Policy para permitir atualização apenas do próprio cliente
CREATE POLICY "Permitir atualização de clientes" ON m24_clientes
    FOR UPDATE USING (id = auth.uid()::uuid);

-- ========================================
-- POLICIES PARA USUARIOS
-- ========================================

-- Policy para permitir leitura de usuários do mesmo cliente
CREATE POLICY "Permitir leitura de usuários do mesmo cliente" ON usuarios
    FOR SELECT USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir inserção de usuários no mesmo cliente
CREATE POLICY "Permitir inserção de usuários" ON usuarios
    FOR INSERT WITH CHECK (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir atualização do próprio usuário
CREATE POLICY "Permitir atualização do próprio usuário" ON usuarios
    FOR UPDATE USING (id = auth.uid()::uuid OR cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir exclusão de usuários do mesmo cliente
CREATE POLICY "Permitir exclusão de usuários" ON usuarios
    FOR DELETE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- ========================================
-- POLICIES PARA CAMPOS
-- ========================================

-- Policy para permitir leitura de campos do mesmo cliente
CREATE POLICY "Permitir leitura de campos do mesmo cliente" ON campos
    FOR SELECT USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir inserção de campos no mesmo cliente
CREATE POLICY "Permitir inserção de campos" ON campos
    FOR INSERT WITH CHECK (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir atualização de campos do mesmo cliente
CREATE POLICY "Permitir atualização de campos" ON campos
    FOR UPDATE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir exclusão de campos do mesmo cliente
CREATE POLICY "Permitir exclusão de campos" ON campos
    FOR DELETE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- ========================================
-- POLICIES PARA CATEGORIAS
-- ========================================

-- Policy para permitir leitura de categorias do mesmo cliente
CREATE POLICY "Permitir leitura de categorias do mesmo cliente" ON categorias
    FOR SELECT USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir inserção de categorias no mesmo cliente
CREATE POLICY "Permitir inserção de categorias" ON categorias
    FOR INSERT WITH CHECK (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir atualização de categorias do mesmo cliente
CREATE POLICY "Permitir atualização de categorias" ON categorias
    FOR UPDATE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir exclusão de categorias do mesmo cliente
CREATE POLICY "Permitir exclusão de categorias" ON categorias
    FOR DELETE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- ========================================
-- POLICIES PARA PRODUTOS
-- ========================================

-- Policy para permitir leitura de produtos do mesmo cliente
CREATE POLICY "Permitir leitura de produtos do mesmo cliente" ON produtos
    FOR SELECT USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir inserção de produtos no mesmo cliente
CREATE POLICY "Permitir inserção de produtos" ON produtos
    FOR INSERT WITH CHECK (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir atualização de produtos do mesmo cliente
CREATE POLICY "Permitir atualização de produtos" ON produtos
    FOR UPDATE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir exclusão de produtos do mesmo cliente
CREATE POLICY "Permitir exclusão de produtos" ON produtos
    FOR DELETE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- ========================================
-- POLICIES PARA EVENTOS
-- ========================================

-- Policy para permitir leitura de eventos do mesmo cliente
CREATE POLICY "Permitir leitura de eventos do mesmo cliente" ON eventos
    FOR SELECT USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir inserção de eventos no mesmo cliente
CREATE POLICY "Permitir inserção de eventos" ON eventos
    FOR INSERT WITH CHECK (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir atualização de eventos do mesmo cliente
CREATE POLICY "Permitir atualização de eventos" ON eventos
    FOR UPDATE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir exclusão de eventos do mesmo cliente
CREATE POLICY "Permitir exclusão de eventos" ON eventos
    FOR DELETE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- ========================================
-- POLICIES PARA PEDIDOS
-- ========================================

-- Policy para permitir leitura de pedidos do mesmo cliente
CREATE POLICY "Permitir leitura de pedidos do mesmo cliente" ON pedidos
    FOR SELECT USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir inserção de pedidos no mesmo cliente
CREATE POLICY "Permitir inserção de pedidos" ON pedidos
    FOR INSERT WITH CHECK (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir atualização de pedidos do mesmo cliente
CREATE POLICY "Permitir atualização de pedidos" ON pedidos
    FOR UPDATE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir exclusão de pedidos do mesmo cliente
CREATE POLICY "Permitir exclusão de pedidos" ON pedidos
    FOR DELETE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- ========================================
-- POLICIES PARA INSCRIÇÕES
-- ========================================

-- Policy para permitir leitura de inscrições do mesmo cliente
CREATE POLICY "Permitir leitura de inscrições do mesmo cliente" ON inscricoes
    FOR SELECT USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir inserção de inscrições no mesmo cliente
CREATE POLICY "Permitir inserção de inscrições" ON inscricoes
    FOR INSERT WITH CHECK (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir atualização de inscrições do mesmo cliente
CREATE POLICY "Permitir atualização de inscrições" ON inscricoes
    FOR UPDATE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir exclusão de inscrições do mesmo cliente
CREATE POLICY "Permitir exclusão de inscrições" ON inscricoes
    FOR DELETE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- ========================================
-- POLICIES PARA CLIENTES_CONFIG
-- ========================================

-- Policy para permitir leitura de configurações do mesmo cliente
CREATE POLICY "Permitir leitura de configurações do mesmo cliente" ON clientes_config
    FOR SELECT USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir inserção de configurações no mesmo cliente
CREATE POLICY "Permitir inserção de configurações" ON clientes_config
    FOR INSERT WITH CHECK (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir atualização de configurações do mesmo cliente
CREATE POLICY "Permitir atualização de configurações" ON clientes_config
    FOR UPDATE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir exclusão de configurações do mesmo cliente
CREATE POLICY "Permitir exclusão de configurações" ON clientes_config
    FOR DELETE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- ========================================
-- POLICIES PARA MANIFESTO_CLIENTES
-- ========================================

-- Policy para permitir leitura de manifestos do mesmo cliente
CREATE POLICY "Permitir leitura de manifestos do mesmo cliente" ON manifesto_clientes
    FOR SELECT USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir inserção de manifestos no mesmo cliente
CREATE POLICY "Permitir inserção de manifestos" ON manifesto_clientes
    FOR INSERT WITH CHECK (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir atualização de manifestos do mesmo cliente
CREATE POLICY "Permitir atualização de manifestos" ON manifesto_clientes
    FOR UPDATE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- Policy para permitir exclusão de manifestos do mesmo cliente
CREATE POLICY "Permitir exclusão de manifestos" ON manifesto_clientes
    FOR DELETE USING (cliente = current_setting('app.tenant_id', true)::uuid);

-- ========================================
-- FUNÇÃO PARA DEFINIR TENANT_ID
-- ========================================

-- Função para definir o tenant_id baseado no domínio
CREATE OR REPLACE FUNCTION set_tenant_from_domain(domain_name text)
RETURNS void AS $$
BEGIN
    -- Buscar o cliente pelo domínio
    PERFORM set_config('app.tenant_id', c.id::text, false)
    FROM m24_clientes c
    WHERE c.dominio = domain_name;
    
    -- Se não encontrar, limpar o tenant_id
    IF NOT FOUND THEN
        PERFORM set_config('app.tenant_id', NULL, false);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS PARA MANTER TENANT_ID
-- ========================================

-- Trigger para garantir que novos registros tenham o tenant_id correto
CREATE OR REPLACE FUNCTION set_tenant_id()
RETURNS trigger AS $$
BEGIN
    -- Se o tenant_id não estiver definido, usar o da sessão
    IF NEW.cliente IS NULL THEN
        NEW.cliente = current_setting('app.tenant_id', true)::uuid;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas que têm campo cliente
CREATE TRIGGER set_tenant_id_usuarios
    BEFORE INSERT ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_campos
    BEFORE INSERT ON campos
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_categorias
    BEFORE INSERT ON categorias
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_produtos
    BEFORE INSERT ON produtos
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_eventos
    BEFORE INSERT ON eventos
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_pedidos
    BEFORE INSERT ON pedidos
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_inscricoes
    BEFORE INSERT ON inscricoes
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_clientes_config
    BEFORE INSERT ON clientes_config
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_manifesto_clientes
    BEFORE INSERT ON manifesto_clientes
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id(); 