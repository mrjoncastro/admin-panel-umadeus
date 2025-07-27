# 🚀 Guia de Instalação - Sistema de Fornecedores no PocketBase

Este guia detalha como configurar completamente o sistema de fornecedores no PocketBase.

## 📋 Pré-requisitos

- PocketBase instalado e funcionando
- Acesso ao Admin Dashboard do PocketBase
- Coleções básicas já existentes: `users`, `clientes`, `produtos`, `pedidos`

---

## 🗂️ Passo 1: Criar Novas Coleções

### 1.1. Coleção `vendors`

1. Acesse **Collections** no admin
2. Clique em **New collection**
3. Configure:
   - **Name**: `vendors`
   - **Type**: `Base`
4. Adicione os campos conforme o schema em `pocketbase-schemas.json`
5. Configure as **API rules**:
   ```
   List: @request.auth.verified = true && (@request.auth.role = 'coordenador' || @request.auth.role = 'lider' || id = @request.auth.vendor_id)
   View: @request.auth.verified = true && (@request.auth.role = 'coordenador' || @request.auth.role = 'lider' || id = @request.auth.vendor_id)
   Create: @request.auth.verified = true && (@request.auth.role = 'coordenador' || @request.auth.role = 'lider')
   Update: @request.auth.verified = true && (@request.auth.role = 'coordenador' || (@request.auth.role = 'lider' && status != 'ativo') || id = @request.auth.vendor_id)
   Delete: @request.auth.verified = true && @request.auth.role = 'coordenador'
   ```

### 1.2. Coleção `comissoes`

1. **New collection** → `comissoes`
2. Adicione os campos do schema
3. Configure as **API rules**:
   ```
   List: @request.auth.verified = true && (@request.auth.role = 'coordenador' || (@request.auth.role = 'lider' && vendor_id.cliente = @request.auth.cliente) || vendor_id = @request.auth.vendor_id)
   View: @request.auth.verified = true && (@request.auth.role = 'coordenador' || (@request.auth.role = 'lider' && vendor_id.cliente = @request.auth.cliente) || vendor_id = @request.auth.vendor_id)
   Create: @request.auth.verified = true && @request.auth.role = 'coordenador'
   Update: @request.auth.verified = true && @request.auth.role = 'coordenador'
   Delete: @request.auth.verified = true && @request.auth.role = 'coordenador'
   ```

### 1.3. Coleção `saques_comissao`

1. **New collection** → `saques_comissao`
2. Adicione os campos do schema
3. Configure as **API rules**:
   ```
   List: @request.auth.verified = true && (@request.auth.role = 'coordenador' || (@request.auth.role = 'lider' && vendor_id.cliente = @request.auth.cliente) || vendor_id = @request.auth.vendor_id)
   View: @request.auth.verified = true && (@request.auth.role = 'coordenador' || (@request.auth.role = 'lider' && vendor_id.cliente = @request.auth.cliente) || vendor_id = @request.auth.vendor_id)
   Create: @request.auth.verified = true && (vendor_id = @request.auth.vendor_id || @request.auth.role = 'coordenador')
   Update: @request.auth.verified = true && (@request.auth.role = 'coordenador' || @request.auth.role = 'lider')
   Delete: @request.auth.verified = true && @request.auth.role = 'coordenador'
   ```

### 1.4. Coleção `produto_avaliacoes`

1. **New collection** → `produto_avaliacoes`
2. Adicione os campos do schema
3. Configure as **API rules**:
   ```
   List: @request.auth.verified = true
   View: @request.auth.verified = true
   Create: @request.auth.verified = true && cliente_id = @request.auth.id
   Update: @request.auth.verified = true && (cliente_id = @request.auth.id || produto_id.vendor_id = @request.auth.vendor_id || @request.auth.role = 'coordenador')
   Delete: @request.auth.verified = true && (@request.auth.role = 'coordenador' || cliente_id = @request.auth.id)
   ```

### 1.5. Coleção `vendor_analytics`

1. **New collection** → `vendor_analytics`
2. Adicione os campos do schema
3. Configure as **API rules**:
   ```
   List: @request.auth.verified = true && (@request.auth.role = 'coordenador' || (@request.auth.role = 'lider' && vendor_id.cliente = @request.auth.cliente) || vendor_id = @request.auth.vendor_id)
   View: @request.auth.verified = true && (@request.auth.role = 'coordenador' || (@request.auth.role = 'lider' && vendor_id.cliente = @request.auth.cliente) || vendor_id = @request.auth.vendor_id)
   Create: @request.auth.verified = true && @request.auth.role = 'coordenador'
   Update: @request.auth.verified = true && @request.auth.role = 'coordenador'
   Delete: @request.auth.verified = true && @request.auth.role = 'coordenador'
   ```

### 1.6. Coleção `vendor_notifications`

1. **New collection** → `vendor_notifications`
2. Adicione os campos do schema
3. Configure as **API rules**:
   ```
   List: @request.auth.verified = true && vendor_id = @request.auth.vendor_id
   View: @request.auth.verified = true && vendor_id = @request.auth.vendor_id
   Create: @request.auth.verified = true && @request.auth.role = 'coordenador'
   Update: @request.auth.verified = true && vendor_id = @request.auth.vendor_id
   Delete: @request.auth.verified = true && (@request.auth.role = 'coordenador' || vendor_id = @request.auth.vendor_id)
   ```

### 1.7. Coleção `marketplace_config`

1. **New collection** → `marketplace_config`
2. Adicione os campos do schema
3. Configure as **API rules**:
   ```
   List: @request.auth.verified = true && (@request.auth.role = 'coordenador' || @request.auth.role = 'lider')
   View: @request.auth.verified = true && (@request.auth.role = 'coordenador' || @request.auth.role = 'lider')
   Create: @request.auth.verified = true && @request.auth.role = 'coordenador'
   Update: @request.auth.verified = true && @request.auth.role = 'coordenador'
   Delete: @request.auth.verified = true && @request.auth.role = 'coordenador'
   ```

---

## 🔧 Passo 2: Modificar Coleções Existentes

### 2.1. Modificar coleção `users`

1. Acesse a coleção **users**
2. Adicione os campos:
   - `vendor_id` (Relation → vendors, optional)
   - `vendor_approved` (Bool, optional)
3. Modifique o campo `role`:
   - Adicione a opção `'fornecedor'` aos valores existentes

### 2.2. Modificar coleção `produtos`

1. Acesse a coleção **produtos**
2. Adicione os novos campos conforme schema:
   - `vendor_id` (Relation → vendors)
   - `origem` (Select: admin, vendor)
   - `created_by` (Relation → users)
   - `created_by_role` (Select: coordenador, lider, fornecedor)
   - `moderacao_status` (Select: pendente, aprovado, rejeitado, revisao)
   - `aprovado` (Bool)
   - `aprovado_por` (Relation → users)
   - `aprovado_por_role` (Select: coordenador, lider)
   - `data_aprovacao` (Date)
   - `motivo_rejeicao` (Editor)
   - `observacoes_internas` (Editor)
   - `destaque` (Bool)
   - `vendas_totais` (Number)
   - `estoque_disponivel` (Number)
   - `estoque_minimo` (Number)
   - `peso` (Number)
   - `dimensoes_altura` (Number)
   - `dimensoes_largura` (Number)
   - `dimensoes_profundidade` (Number)

### 2.3. Modificar coleção `pedidos`

1. Acesse a coleção **pedidos**
2. Adicione os campos:
   - `vendor_ids` (JSON)
   - `gera_comissao` (Bool)
   - `comissao_calculada` (Bool)
   - `comissao_valor_total` (Number)

---

## 📊 Passo 3: Criar Índices

1. Acesse **Settings** → **Logs and backups**
2. Abra o **Console**
3. Execute os scripts SQL do arquivo `pocketbase-migration-scripts.sql`
4. Verifique se os índices foram criados:
   ```sql
   SELECT name, sql FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%';
   ```

---

## ⚙️ Passo 4: Configurar Dados Iniciais

### 4.1. Configuração do Marketplace

Para cada cliente, insira uma configuração padrão:

```sql
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
    'SEU_CLIENT_ID_AQUI',
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
```

### 4.2. Definir Valores Padrão

Para produtos existentes, execute:

```sql
UPDATE produtos SET 
    origem = 'admin',
    moderacao_status = 'aprovado',
    aprovado = true,
    vendas_totais = 0,
    estoque_disponivel = 0,
    estoque_minimo = 5,
    destaque = false
WHERE vendor_id IS NULL;
```

---

## 🔐 Passo 5: Configurar Segurança

### 5.1. Verificar API Rules

Confirme que todas as coleções têm as regras de API configuradas corretamente conforme documentado acima.

### 5.2. Configurar CORS (se necessário)

Se estiver usando em produção, configure CORS em **Settings** → **Application**:

```
https://seudominio.com
http://localhost:3000 (para desenvolvimento)
```

### 5.3. Configurar Autenticação

Em **Settings** → **Auth providers**, configure:
- Email/Password habilitado
- Verificação de email (recomendado)
- Configurações de senha segura

---

## 🧪 Passo 6: Testes

### 6.1. Testar Criação de Fornecedor

1. Faça login como coordenador
2. Tente criar um fornecedor via API:
   ```javascript
   const vendor = await pb.collection('vendors').create({
     nome: 'Teste Fornecedor',
     email: 'teste@fornecedor.com',
     documento: '12345678901',
     tipo_documento: 'cpf',
     telefone: '11999999999',
     endereco_cep: '01234567',
     endereco_rua: 'Rua Teste',
     endereco_numero: '123',
     endereco_bairro: 'Centro',
     endereco_cidade: 'São Paulo',
     endereco_estado: 'SP',
     endereco_pais: 'Brasil',
     status: 'ativo',
     comissao_percentual: 25,
     valor_minimo_saque: 20,
     banco: 'Banco Teste',
     agencia: '1234',
     conta: '12345-6',
     tipo_conta: 'corrente',
     titular: 'Teste Fornecedor',
     documento_titular: '12345678901',
     cliente: 'CLIENT_ID',
     created_by: 'USER_ID',
     created_by_role: 'coordenador'
   });
   ```

### 6.2. Testar Permissões

1. Tente acessar dados como diferentes roles
2. Verifique se as regras de API estão funcionando
3. Teste criação de produtos por fornecedores

### 6.3. Testar Relacionamentos

1. Crie um produto associado a um fornecedor
2. Verifique se os relacionamentos funcionam
3. Teste as consultas com `expand`

---

## 📈 Passo 7: Monitoramento

### 7.1. Configurar Logs

Em **Settings** → **Logs and backups**:
- Habilite logs detalhados
- Configure retenção adequada

### 7.2. Backup Automático

Configure backup automático:
- Diário para dados críticos
- Semanal para arquivos

### 7.3. Monitorar Performance

Use as consultas de debugging em `pocketbase-migration-scripts.sql` para monitorar:
- Performance das consultas
- Uso dos índices
- Integridade dos dados

---

## 🚨 Troubleshooting

### Problema: Erro ao criar fornecedor
**Solução**: Verifique se o campo `cliente` está sendo preenchido corretamente

### Problema: Regras de API não funcionam
**Solução**: Confirme que o token de autenticação tem os campos `role` e `vendor_id` corretos

### Problema: Relacionamentos não funcionam
**Solução**: Verifique se os IDs das coleções estão corretos nos campos de relação

### Problema: Performance lenta
**Solução**: Confirme que os índices foram criados corretamente

---

## ✅ Checklist Final

- [ ] Todas as 7 novas coleções criadas
- [ ] Coleções existentes modificadas (users, produtos, pedidos)
- [ ] Todos os índices criados
- [ ] API rules configuradas
- [ ] Configuração inicial inserida
- [ ] Testes de permissão realizados
- [ ] Backup configurado
- [ ] Monitoramento ativo

---

## 📞 Suporte

Para dúvidas sobre a implementação:
1. Consulte a documentação em `banco-de-dados-fornecedores.md`
2. Verifique os tipos em `types/marketplace.ts`
3. Revise os schemas em `pocketbase-schemas.json`

O sistema está pronto para uso! 🎉