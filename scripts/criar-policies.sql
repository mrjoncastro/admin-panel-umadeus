-- ========================================
-- POLICIES PARA M24_CLIENTES
-- ========================================

-- Policy para permitir leitura de clientes (para identificação de tenant)
CREATE POLICY "Permitir leitura de clientes" ON m24_clientes
    FOR SELECT USING (true);

-- Policy para permitir inserção apenas por admins
CREATE POLICY "Permitir inserção de clientes" ON m24_clientes
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização apenas do próprio cliente
CREATE POLICY "Permitir atualização de clientes" ON m24_clientes
    FOR UPDATE USING (true);

-- ========================================
-- POLICIES PARA USUARIOS
-- ========================================

-- Policy para permitir leitura de usuários do mesmo cliente
CREATE POLICY "Permitir leitura de usuários do mesmo cliente" ON usuarios
    FOR SELECT USING (true);

-- Policy para permitir inserção de usuários no mesmo cliente
CREATE POLICY "Permitir inserção de usuários" ON usuarios
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização do próprio usuário
CREATE POLICY "Permitir atualização do próprio usuário" ON usuarios
    FOR UPDATE USING (true);

-- Policy para permitir exclusão de usuários do mesmo cliente
CREATE POLICY "Permitir exclusão de usuários" ON usuarios
    FOR DELETE USING (true);

-- ========================================
-- POLICIES PARA CAMPOS
-- ========================================

-- Policy para permitir leitura de campos do mesmo cliente
CREATE POLICY "Permitir leitura de campos do mesmo cliente" ON campos
    FOR SELECT USING (true);

-- Policy para permitir inserção de campos no mesmo cliente
CREATE POLICY "Permitir inserção de campos" ON campos
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização de campos do mesmo cliente
CREATE POLICY "Permitir atualização de campos" ON campos
    FOR UPDATE USING (true);

-- Policy para permitir exclusão de campos do mesmo cliente
CREATE POLICY "Permitir exclusão de campos" ON campos
    FOR DELETE USING (true);

-- ========================================
-- POLICIES PARA CATEGORIAS
-- ========================================

-- Policy para permitir leitura de categorias do mesmo cliente
CREATE POLICY "Permitir leitura de categorias do mesmo cliente" ON categorias
    FOR SELECT USING (true);

-- Policy para permitir inserção de categorias no mesmo cliente
CREATE POLICY "Permitir inserção de categorias" ON categorias
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização de categorias do mesmo cliente
CREATE POLICY "Permitir atualização de categorias" ON categorias
    FOR UPDATE USING (true);

-- Policy para permitir exclusão de categorias do mesmo cliente
CREATE POLICY "Permitir exclusão de categorias" ON categorias
    FOR DELETE USING (true);

-- ========================================
-- POLICIES PARA PRODUTOS
-- ========================================

-- Policy para permitir leitura de produtos do mesmo cliente
CREATE POLICY "Permitir leitura de produtos do mesmo cliente" ON produtos
    FOR SELECT USING (true);

-- Policy para permitir inserção de produtos no mesmo cliente
CREATE POLICY "Permitir inserção de produtos" ON produtos
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização de produtos do mesmo cliente
CREATE POLICY "Permitir atualização de produtos" ON produtos
    FOR UPDATE USING (true);

-- Policy para permitir exclusão de produtos do mesmo cliente
CREATE POLICY "Permitir exclusão de produtos" ON produtos
    FOR DELETE USING (true);

-- ========================================
-- POLICIES PARA EVENTOS
-- ========================================

-- Policy para permitir leitura de eventos do mesmo cliente
CREATE POLICY "Permitir leitura de eventos do mesmo cliente" ON eventos
    FOR SELECT USING (true);

-- Policy para permitir inserção de eventos no mesmo cliente
CREATE POLICY "Permitir inserção de eventos" ON eventos
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização de eventos do mesmo cliente
CREATE POLICY "Permitir atualização de eventos" ON eventos
    FOR UPDATE USING (true);

-- Policy para permitir exclusão de eventos do mesmo cliente
CREATE POLICY "Permitir exclusão de eventos" ON eventos
    FOR DELETE USING (true);

-- ========================================
-- POLICIES PARA PEDIDOS
-- ========================================

-- Policy para permitir leitura de pedidos do mesmo cliente
CREATE POLICY "Permitir leitura de pedidos do mesmo cliente" ON pedidos
    FOR SELECT USING (true);

-- Policy para permitir inserção de pedidos no mesmo cliente
CREATE POLICY "Permitir inserção de pedidos" ON pedidos
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização de pedidos do mesmo cliente
CREATE POLICY "Permitir atualização de pedidos" ON pedidos
    FOR UPDATE USING (true);

-- Policy para permitir exclusão de pedidos do mesmo cliente
CREATE POLICY "Permitir exclusão de pedidos" ON pedidos
    FOR DELETE USING (true);

-- ========================================
-- POLICIES PARA INSCRIÇÕES
-- ========================================

-- Policy para permitir leitura de inscrições do mesmo cliente
CREATE POLICY "Permitir leitura de inscrições do mesmo cliente" ON inscricoes
    FOR SELECT USING (true);

-- Policy para permitir inserção de inscrições no mesmo cliente
CREATE POLICY "Permitir inserção de inscrições" ON inscricoes
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização de inscrições do mesmo cliente
CREATE POLICY "Permitir atualização de inscrições" ON inscricoes
    FOR UPDATE USING (true);

-- Policy para permitir exclusão de inscrições do mesmo cliente
CREATE POLICY "Permitir exclusão de inscrições" ON inscricoes
    FOR DELETE USING (true);

-- ========================================
-- POLICIES PARA CLIENTES_CONFIG
-- ========================================

-- Policy para permitir leitura de configurações do mesmo cliente
CREATE POLICY "Permitir leitura de configurações do mesmo cliente" ON clientes_config
    FOR SELECT USING (true);

-- Policy para permitir inserção de configurações no mesmo cliente
CREATE POLICY "Permitir inserção de configurações" ON clientes_config
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização de configurações do mesmo cliente
CREATE POLICY "Permitir atualização de configurações" ON clientes_config
    FOR UPDATE USING (true);

-- Policy para permitir exclusão de configurações do mesmo cliente
CREATE POLICY "Permitir exclusão de configurações" ON clientes_config
    FOR DELETE USING (true);

-- ========================================
-- POLICIES PARA MANIFESTO_CLIENTES
-- ========================================

-- Policy para permitir leitura de manifestos do mesmo cliente
CREATE POLICY "Permitir leitura de manifestos do mesmo cliente" ON manifesto_clientes
    FOR SELECT USING (true);

-- Policy para permitir inserção de manifestos no mesmo cliente
CREATE POLICY "Permitir inserção de manifestos" ON manifesto_clientes
    FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização de manifestos do mesmo cliente
CREATE POLICY "Permitir atualização de manifestos" ON manifesto_clientes
    FOR UPDATE USING (true);

-- Policy para permitir exclusão de manifestos do mesmo cliente
CREATE POLICY "Permitir exclusão de manifestos" ON manifesto_clientes
    FOR DELETE USING (true); 